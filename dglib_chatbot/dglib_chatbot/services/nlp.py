import os
import json
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
from torchcrf import CRF
from safetensors.torch import load_file

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class JointIntentNERModel(nn.Module):
    def __init__(self, model_name, num_intents, num_ner_tags, dropout_prob=0.1):
        super(JointIntentNERModel, self).__init__()
        self.roberta = AutoModel.from_pretrained(model_name)
        
        self.intent_classifier = nn.Sequential(
            nn.Linear(self.roberta.config.hidden_size, self.roberta.config.hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout_prob),
            nn.Linear(self.roberta.config.hidden_size, num_intents)
        )
        
        self.ner_emitter = nn.Sequential(
            nn.Linear(self.roberta.config.hidden_size, self.roberta.config.hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout_prob),
            nn.Linear(self.roberta.config.hidden_size // 2, num_ner_tags)
        )
        
        self.crf = CRF(num_ner_tags, batch_first=True)

    def forward(self, input_ids, attention_mask, ner_labels=None):
        outputs = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state
        
        pooled_output = sequence_output[:, 0, :]
        intent_logits = self.intent_classifier(pooled_output)
        
        ner_emissions = self.ner_emitter(sequence_output)
        
        if ner_labels is not None:
            mask = attention_mask.bool()
            ner_loss = -self.crf(ner_emissions, ner_labels, mask=mask, reduction='mean')
            return intent_logits, ner_loss
        else:
            mask = attention_mask.bool()
            ner_preds = self.crf.decode(ner_emissions, mask=mask)
            return intent_logits, ner_preds


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..\model")

with open(os.path.join(MODEL_DIR, "config.json"), "r", encoding="utf-8") as f:
    config = json.load(f)

intent_labels = config["intent_labels"]
ner_tags = config["ner_tags"]
MAX_LENGTH = config["max_length"]

id2intent = {idx: intent for idx, intent in enumerate(intent_labels)}
id2tag = {idx: tag for idx, tag in enumerate(ner_tags)}

MODEL_NAME = "klue/roberta-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

model = JointIntentNERModel(
    model_name=MODEL_NAME,
    num_intents=len(intent_labels),
    num_ner_tags=len(ner_tags)
)


model.load_state_dict(load_file(os.path.join(MODEL_DIR, "model.safetensors")))
model = model.to(device)
model.eval()


def extract_entities_from_tokens(text, token_predictions, offset_mapping, id2tag):
    entities = []
    current_entity = None

    for i, (pred, (start, end)) in enumerate(zip(token_predictions, offset_mapping)):
        if start == end:
            continue

        tag = id2tag[pred]

        if tag.startswith("B-") or (tag.startswith("I-") and current_entity is None):
            if current_entity is not None:
                entities.append(current_entity)

            entity_type = tag[2:]
            current_entity = {
                "type": entity_type,
                "start": start,
                "end": end,
                "text": text[start:end]
            }
        
        elif tag.startswith("I-") and current_entity is not None and current_entity["type"] == tag[2:]:
            current_entity["end"] = end
            current_entity["text"] = text[current_entity["start"]:end]

        else:
            if current_entity is not None:
                entities.append(current_entity)
            current_entity = None

    if current_entity is not None:
        entities.append(current_entity)

    if not entities:
        return []

    filtered_entities = []
    sorted_entities = sorted(entities, key=lambda e: len(e["text"]), reverse=True)
    
    for entity in sorted_entities:
        is_contained = False
        for filtered in filtered_entities:
            if (entity["start"] >= filtered["start"] and entity["end"] <= filtered["end"]):
                is_contained = True
                break
        
        if not is_contained:
            filtered_entities.append(entity)

    return sorted(filtered_entities, key=lambda e: e["start"])

def predict_intent_and_entities(text, model, tokenizer, id2intent, id2tag):
    model.eval()
    
    encoding = tokenizer(
        text,
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_offsets_mapping=True,
        return_tensors="pt"
    )
    
    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)
    offset_mapping = encoding["offset_mapping"].squeeze().cpu().numpy()
    
    with torch.no_grad():
        intent_logits, ner_preds_decoded = model(input_ids, attention_mask)


        intent_probs = torch.softmax(intent_logits, dim=1).cpu().numpy()[0]
        intent_pred = torch.argmax(intent_logits, dim=1).cpu().numpy()[0]
        intent_name = id2intent[intent_pred]
        intent_confidence = float(intent_probs[intent_pred])
        
        ner_pred_ids = ner_preds_decoded[0]
        
        entities = extract_entities_from_tokens(text, ner_pred_ids, offset_mapping, id2tag)
    
    return {
        "intent": intent_name,
        "intent_confidence": intent_confidence,
        "entities": entities
    }

def postprocess_prediction(text, prediction):
    current_intent = prediction["intent"]
    original_model_intent = prediction["intent"] 
    entities = prediction["entities"]
    intent_confidence = prediction["intent_confidence"]
    
    has_author_entity = any(e["type"] == "AUTHOR" for e in entities)
    has_book_entity = any(e["type"] == "BOOK" for e in entities)

    if original_model_intent == "도서검색" and has_author_entity and not has_book_entity:
        current_intent = "작가검색" 

    elif original_model_intent == "작가검색" and has_book_entity and not has_author_entity:
        current_intent = "도서검색"

    return {
        "intent": current_intent,
        "intent_confidence": intent_confidence,
        "entities": entities,
        "original_intent": original_model_intent,
        "text": text
    }

def analyze_text(text):
    raw_prediction = predict_intent_and_entities(text, model, tokenizer, id2intent, id2tag)
    final_prediction = postprocess_prediction(text, raw_prediction)
    return final_prediction