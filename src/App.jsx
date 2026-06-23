import { useState } from "react";
import { ClerkLoading, Show, SignIn, UserButton } from "@clerk/react";
import { QUESTION_SETS, getQuestionSet } from "./questionSets.js";

function resetQuizState() {
	return {
		currentIndex: 0,
		selectedIndices: [],
		resultShownForIndex: null,
		answers: {},
	};
}

function getCorrectCount(question) {
	return question.odpowiedzi.filter((o) => o.correct).length;
}

function isAnswerCorrect(question, selectedIndices) {
	const correctIndices = new Set(
		question.odpowiedzi
			.map((o, i) => (o.correct ? i : -1))
			.filter((i) => i >= 0),
	);
	const selected = new Set(selectedIndices);
	if (correctIndices.size !== selected.size) return false;
	for (const i of selected) if (!correctIndices.has(i)) return false;
	return true;
}

function AuthScreen() {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md mb-6 text-center">
				<h1 className="text-xl font-semibold text-zinc-200">
					Wejście do testu
				</h1>
				<p className="text-sm text-zinc-500 mt-2">
					Zaloguj się, żeby kontynuować
				</p>
			</div>
			<SignIn routing="hash" />
		</div>
	);
}

function QuizApp() {
	const [selectedSetId, setSelectedSetId] = useState(QUESTION_SETS[0].id);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedIndices, setSelectedIndices] = useState([]);
	const [resultShownForIndex, setResultShownForIndex] = useState(null);
	const [answers, setAnswers] = useState({});

	const activeSet = getQuestionSet(selectedSetId);
	const pytania = activeSet.questions;

	const handleSetChange = (e) => {
		setSelectedSetId(e.target.value);
		const reset = resetQuizState();
		setCurrentIndex(reset.currentIndex);
		setSelectedIndices(reset.selectedIndices);
		setResultShownForIndex(reset.resultShownForIndex);
		setAnswers(reset.answers);
	};

	const question = pytania[currentIndex];
	const isMultiSelect = getCorrectCount(question) > 1;
	const hasSelection = selectedIndices.length > 0;
	const showResult = resultShownForIndex === currentIndex;
	const isLastQuestion = currentIndex === pytania.length - 1;
	const isFirstQuestion = currentIndex === 0;

	const answeredCount = Object.keys(answers).length;
	const correctCount = Object.entries(answers).filter(([qi, indices]) =>
		isAnswerCorrect(pytania[Number(qi)], indices),
	).length;

	const handleSelect = (index) => {
		if (showResult) return;
		setSelectedIndices((prev) => {
			if (isMultiSelect) {
				const has = prev.includes(index);
				return has ? prev.filter((i) => i !== index) : [...prev, index];
			}
			return prev.includes(index) ? [] : [index];
		});
	};

	const handleCofnij = () => {
		if (isFirstQuestion) return;
		const prevIndex = currentIndex - 1;
		setCurrentIndex(prevIndex);
		setSelectedIndices(answers[prevIndex] ?? []);
		setResultShownForIndex(answers[prevIndex] !== undefined ? prevIndex : null);
	};

	const handleDalej = () => {
		if (showResult) {
			setResultShownForIndex(null);
			if (isLastQuestion) {
				setCurrentIndex(0);
				setSelectedIndices([]);
				setAnswers({});
				return;
			}
			setCurrentIndex((i) => i + 1);
			setSelectedIndices([]);
			return;
		}
		if (!hasSelection) return;
		setAnswers((prev) => ({ ...prev, [currentIndex]: [...selectedIndices] }));
		setResultShownForIndex(currentIndex);
	};

	const getOptionStyle = (odp, index) => {
		if (!showResult) {
			const isSelected = selectedIndices.includes(index);
			return {
				selected: isSelected,
				className: isSelected
					? "border-amber-500 bg-amber-500/15 text-amber-100"
					: "border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800",
				dotClassName: isSelected
					? "border-amber-500 bg-amber-500"
					: "border-zinc-500",
			};
		}
		const isSelected = selectedIndices.includes(index);
		const isCorrect = odp.correct;
		if (isCorrect && isSelected)
			return {
				selected: true,
				className: "border-emerald-500 bg-emerald-500/20 text-emerald-100",
				dotClassName: "border-emerald-500 bg-emerald-500",
			};
		if (isCorrect && !isSelected)
			return {
				selected: false,
				className: "border-emerald-500/70 bg-emerald-500/10 text-emerald-200",
				dotClassName: "border-emerald-500",
			};
		if (!isCorrect && isSelected)
			return {
				selected: true,
				className: "border-red-500 bg-red-500/20 text-red-100",
				dotClassName: "border-red-500 bg-red-500",
			};
		return {
			selected: false,
			className: "border-zinc-700 bg-zinc-800/30 text-zinc-500",
			dotClassName: "border-zinc-600",
		};
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
			{answeredCount > 0 && (
				<div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
					<div className="max-w-2xl mx-auto flex items-center justify-between">
						<span className="text-sm text-zinc-400">Wynik dotychczasowy</span>
						<span className="text-sm font-medium text-zinc-200">
							<span className="text-emerald-400">{correctCount}</span>
							<span className="text-zinc-500"> / </span>
							<span>{answeredCount}</span>
							<span className="text-zinc-500"> poprawnych</span>
						</span>
					</div>
				</div>
			)}
			<header className="border-b border-zinc-800 px-6 py-4">
				<div className="max-w-2xl mx-auto space-y-3">
					<div className="flex items-center justify-between gap-4">
						<h1 className="text-lg font-semibold text-zinc-200 shrink-0">
							Test
						</h1>
						<div className="flex items-center gap-3 shrink-0">
							<span className="text-sm text-zinc-500">
								Pytanie {currentIndex + 1} / {pytania.length}
							</span>
							<UserButton />
						</div>
					</div>
					<label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
						<span className="text-sm text-zinc-400 shrink-0">Zestaw pytań</span>
						<select
							value={selectedSetId}
							onChange={handleSetChange}
							className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800/50 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
						>
							{QUESTION_SETS.map((set) => (
								<option key={set.id} value={set.id}>
									{set.label} ({set.questions.length} pytań)
								</option>
							))}
						</select>
					</label>
				</div>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center p-6">
				<article className="w-full max-w-2xl">
					<div className="mb-2 text-xs text-zinc-500">
						{question.rok != null && `${question.rok} · `}nr {question.nr}
						{isMultiSelect && (
							<span className="ml-2 text-amber-400/90">
								· wielokrotny wybór
							</span>
						)}
					</div>
					<h2 className="text-xl font-medium text-zinc-100 mb-6 whitespace-pre-line">
						{question.tresc}
					</h2>

					<ul className="space-y-3">
						{question.odpowiedzi.map((odp, index) => {
							const style = getOptionStyle(odp, index);
							const shapeClass = isMultiSelect ? "rounded-md" : "rounded-full";
							return (
								<li key={`${selectedSetId}-${question.nr}-${index}`}>
									<button
										type="button"
										onClick={() => handleSelect(index)}
										disabled={showResult}
										className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${style.className} ${showResult ? "cursor-default" : ""}`}
									>
										<span className="flex items-start gap-3">
											<span
												className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${shapeClass} ${style.dotClassName}`}
											>
												{style.selected &&
													(isMultiSelect ? (
														<span className="text-zinc-950 text-xs font-bold">
															✓
														</span>
													) : (
														<span className="h-2 w-2 rounded-full bg-zinc-950" />
													))}
											</span>
											<span className="whitespace-pre-line">{odp.tresc}</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>

					<div className="mt-8 flex items-center justify-between gap-4">
						{!isFirstQuestion && (
							<button
								type="button"
								onClick={handleCofnij}
								className="px-5 py-2.5 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 rounded-lg transition-colors"
							>
								Cofnij
							</button>
						)}
						<div
							className={
								isFirstQuestion
									? "w-full flex justify-end"
									: "flex-1 flex justify-end"
							}
						>
							{hasSelection && (
								<button
									type="button"
									onClick={handleDalej}
									className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
								>
									{showResult
										? isLastQuestion
											? "Zakończ"
											: "Dalej"
										: "Dalej"}
								</button>
							)}
						</div>
					</div>
				</article>
			</main>
		</div>
	);
}

function App() {
	return (
		<>
			<ClerkLoading>
				<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
					<p className="text-zinc-400 text-sm">Ładowanie...</p>
				</div>
			</ClerkLoading>
			<Show when="signed-out">
				<AuthScreen />
			</Show>
			<Show when="signed-in">
				<QuizApp />
			</Show>
		</>
	);
}

export default App;
