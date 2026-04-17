import { useState, useCallback, useRef, useMemo } from 'react';
import { shuffle } from '../lib/shuffle';

import animalsData from '../data/words/animals.json';
import objectsData from '../data/words/objects.json';
import foodData from '../data/words/food.json';
import placesData from '../data/words/places.json';
import actionsData from '../data/words/actions.json';
import famousData from '../data/words/famous.json';

const ALL_CATEGORIES = [
  animalsData,
  objectsData,
  foodData,
  placesData,
  actionsData,
  famousData,
];

export function useWords() {
  const allWords = useMemo(() => {
    const words = ALL_CATEGORIES.flatMap((cat) => cat.words);
    return shuffle(words);
  }, []);

  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const indexRef = useRef(0);
  const shuffledRef = useRef(allWords);

  const getNextWord = useCallback((): string => {
    // If we've used all words, reshuffle
    if (indexRef.current >= shuffledRef.current.length) {
      shuffledRef.current = shuffle(shuffledRef.current);
      indexRef.current = 0;
      setUsedWords(new Set());
    }

    const word = shuffledRef.current[indexRef.current];
    indexRef.current++;
    setUsedWords((prev) => new Set(prev).add(word));
    return word;
  }, []);

  const reset = useCallback(() => {
    shuffledRef.current = shuffle(allWords);
    indexRef.current = 0;
    setUsedWords(new Set());
  }, [allWords]);

  return {
    getNextWord,
    usedWords,
    totalWords: allWords.length,
    reset,
    categories: ALL_CATEGORIES.map((c) => c.category),
  };
}
