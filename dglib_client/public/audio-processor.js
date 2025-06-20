// @ts-nocheck

class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.sourceSampleRate = options.processorOptions.sourceSampleRate;
      this.targetSampleRate = options.processorOptions.targetSampleRate;
      this.bufferSize = 128 * 50; 
      this.buffer = new Float32Array(this.bufferSize);
      this.bufferIndex = 0;
    }
  

    resample(buffer) {
      if (this.sourceSampleRate === this.targetSampleRate) {
        return buffer;
      }
      const ratio = this.sourceSampleRate / this.targetSampleRate;
      const newLength = Math.round(buffer.length / ratio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < newLength) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
    }
  
  
    float32ToInt16(buffer) {
      const int16Buffer = new Int16Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
       
        const s = Math.max(-1, Math.min(1, buffer[i]));
      
        int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return int16Buffer;
    }
  
    process(inputs, outputs, parameters) {
      const inputChannel = inputs[0] && inputs[0][0];
  
      if (!inputChannel) {
        return true;
      }
  
      
      const remainingSpace = this.bufferSize - this.bufferIndex;
      const chunkSize = Math.min(remainingSpace, inputChannel.length);
      this.buffer.set(inputChannel.subarray(0, chunkSize), this.bufferIndex);
      this.bufferIndex += chunkSize;
  
     
      if (this.bufferIndex >= this.bufferSize) {
       
        const resampled = this.resample(this.buffer);
  
        
        const int16Array = this.float32ToInt16(resampled);
  
        
        if (int16Array.length > 0) {
          this.port.postMessage(int16Array.buffer, [int16Array.buffer]);
        }
        
       
        this.bufferIndex = 0;
      }
  
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);