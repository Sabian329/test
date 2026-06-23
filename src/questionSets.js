import pytania from "./data/pytania.json";
import pytania2 from "./data/pytania2.json";

export const QUESTION_SETS = [
	{ id: "pytania", label: "Zestaw 1", questions: pytania },
	{ id: "pytania2", label: "Zestaw 2", questions: pytania2 },
];

export function getQuestionSet(id) {
	return QUESTION_SETS.find((set) => set.id === id) ?? QUESTION_SETS[0];
}
