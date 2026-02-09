import { useState, useEffect, useRef } from "react";
import pytania from "./data/pytania.json";

const SITE_PIN_KEY = "site_pin_ok";
const requiredPin = import.meta.env.SITE_PIN ?? "";

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

function PinGate({ onUnlock }) {
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");
	const inputRef = useRef(null);
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");
		const trimmed = pin.replace(/\D/g, "").slice(0, 6);
		if (trimmed.length !== 6) {
			setError("PIN musi mieć 6 cyfr");
			return;
		}
		if (trimmed !== requiredPin) {
			setError("Nieprawidłowy PIN");
			setPin("");
			return;
		}
		try {
			sessionStorage.setItem(SITE_PIN_KEY, "1");
		} catch (_) {}
		onUnlock();
	};

	const handleChange = (e) => {
		const v = e.target.value.replace(/\D/g, "").slice(0, 6);
		setPin(v);
		setError("");
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-xs">
				<h1 className="text-xl font-semibold text-zinc-200 mb-2 text-center">
					Wejście do testu
				</h1>
				<p className="text-sm text-zinc-500 mb-6 text-center">
					Wpisz 6-cyfrowy PIN
				</p>
				<form onSubmit={handleSubmit}>
					<input
						ref={inputRef}
						type="password"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						value={pin}
						onChange={handleChange}
						placeholder="••••••"
						className="w-full px-4 py-3 rounded-xl border border-zinc-600 bg-zinc-800/50 text-zinc-100 text-center text-lg tracking-[0.5em] placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
					/>
					{error && (
						<p className="mt-2 text-sm text-red-400 text-center">{error}</p>
					)}
					<button
						type="submit"
						className="mt-4 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
					>
						Wejdź
					</button>
				</form>
			</div>
		</div>
	);
}

function App() {
	const [unlocked, setUnlocked] = useState(() => {
		if (!requiredPin) return true;
		try {
			return sessionStorage.getItem(SITE_PIN_KEY) === "1";
		} catch {
			return false;
		}
	});
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedIndices, setSelectedIndices] = useState([]);
	const [resultShownForIndex, setResultShownForIndex] = useState(null);
	const [answers, setAnswers] = useState({});

	useEffect(() => {
		if (!requiredPin) setUnlocked(true);
	}, []);

	if (!unlocked) {
		return <PinGate onUnlock={() => setUnlocked(true)} />;
	}

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
				<div className="max-w-2xl mx-auto flex items-center justify-between">
					<h1 className="text-lg font-semibold text-zinc-200">Test</h1>
					<span className="text-sm text-zinc-500">
						Pytanie {currentIndex + 1} / {pytania.length}
					</span>
				</div>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center p-6">
				<article className="w-full max-w-2xl">
					<div className="mb-2 text-xs text-zinc-500">
						{question.rok} · nr {question.nr}
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
								<li key={`${question.nr}-${index}`}>
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

export default App;
