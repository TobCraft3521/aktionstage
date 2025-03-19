export const getRandomNoResultsJoke = () => {
  const jokes = [
    {
      emoji: "🎲",
      text: "No risk, no fun! Probier mal Filter auf null.",
    },
    {
      emoji: "😵‍💫",
      text: "Sogar Google hätte hier nichts gefunden.",
    },
    {
      emoji: "😝",
      text: "Das ist mir jetzt zu wählerisch.",
    },
    {
      emoji: "🎯",
      text: "Keine Treffer? Übung macht den Meister. Tip: Filter aus!",
    },
    {
      emoji: "😜",
      text: "YOLO! Warum noch Filter? Der Spaß beginnt ohne.",
    },
    {
      emoji: "💥",
      text: "Filter aus, Chaos an – jetzt wird's spannend!",
    },
    {
      emoji: "📚",
      text: "Wenn du noch einen Filter hinzufügst, wird's bald ein Rätselbuch!",
    },
    {
      emoji: "✌️",
      text: "Keine Filter, kein Stress.",
    },
    {
      emoji: "🏞️",
      text: "Filter aus, das produziert nur CO₂.",
    },
    {
      emoji: "🚨",
      text: "Suchpolizei hier! Verhaftet wegen zu strenger Filter!",
    },
    {
      emoji: "👽",
      text: "Selbst Aliens finden hier nichts. Vielleicht auf Mars probieren?",
    },
    {
      emoji: "🏝️",
      text: "Du hast eine geheime Schatzkarte gefunden! 🗺️ Leider ohne Schatz. 🤷‍♂️",
    },
  ]

  return jokes[Math.floor(Math.random() * jokes.length)]
}
