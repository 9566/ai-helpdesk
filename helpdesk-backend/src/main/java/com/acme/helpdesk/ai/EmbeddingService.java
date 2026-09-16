package com.acme.helpdesk.ai;

import com.pgvector.PGvector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {

    @Autowired
    private GeminiService geminiService;

    public PGvector embedText(String text) {
        List<Double> doubleList = geminiService.generateEmbedding(text);
        float[] floatArray = new float[doubleList.size()];
        for (int i = 0; i < doubleList.size(); i++) {
            floatArray[i] = doubleList.get(i).floatValue();
        }
        return new PGvector(floatArray);
    }
}
