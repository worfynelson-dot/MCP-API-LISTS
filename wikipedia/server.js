import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Helper ambil data Wikipedia
async function getWikipediaData(query, lang = "id") {
  const encoded = encodeURIComponent(query);
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Article not found");
  }

  return await response.json();
}

// Endpoint utama
app.get("/wikipedia", async (req, res) => {
  try {
    const { q, lang = "id", type = "summary" } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Parameter 'q' wajib diisi"
      });
    }

    const data = await getWikipediaData(q, lang);

    if (type === "full") {
      return res.json({
        title: data.title,
        description: data.description,
        content: data.extract,
        thumbnail: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page,
        language: lang
      });
    }

    res.json({
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
      language: lang
    });

  } catch (err) {
    res.status(500).json({
      error: "Gagal ambil artikel",
      details: err.message
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Wikipedia MCP v2 running",
    usage: "/wikipedia?q=keyword&lang=id|en&type=summary|full"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
