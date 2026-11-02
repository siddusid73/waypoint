package com.roadtrip.service;

import com.roadtrip.dto.tag.TagResponse;
import com.roadtrip.model.Tag;
import com.roadtrip.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(t -> new TagResponse(t.getId(), t.getName()))
                .toList();
    }

    /** Looks up each tag name; creates a new Tag row the first time a name is used. */
    public Set<Tag> resolveOrCreate(List<String> tagNames) {
        Set<Tag> result = new HashSet<>();
        if (tagNames == null) return result;

        for (String rawName : tagNames) {
            String name = rawName.trim().toLowerCase();
            if (name.isEmpty()) continue;

            Tag tag = tagRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(name);
                        return tagRepository.save(newTag);
                    });
            result.add(tag);
        }
        return result;
    }
}
