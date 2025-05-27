import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { deleteQna } from "../api/qnaApi";

export const useQnaDelteMutaion= ({requeseterMid, onSuccessNavigate})=>{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async(qno) => {
            return await deleteQna(qno, requeseterMid);
        }
    })
}