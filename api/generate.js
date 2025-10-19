// api/generate.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    }

    // Lire le corps de la requête (body)
    const body = req.body;
    const name = (body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: "Le champ 'name' est manquant dans la requête." });
    }

    // Créer le texte à envoyer à Gemini
    const prompt = `Écris une courte description marketing (1 à 2 phrases) pour le produit suivant : ${name}`;

    // Lire la clé depuis les variables d'environnement
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé GEMINI_API_KEY non configurée sur le serveur.' });
    }

    // Appel à l’API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    // Extraire le texte généré
    const description =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'Aucune description générée.';

    return res.status(200).json({ description });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}
