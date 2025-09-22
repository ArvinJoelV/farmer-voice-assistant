import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";

interface WeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: { description: string }[];
  wind: { speed: number };
}

interface NewsArticle {
  title: string;
  source: { name: string };
  publishedAt: string;
}

export default function ExplorePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const WEATHER_API_KEY = "hi"; // your key
  const NEWS_API_KEY = "d08e9cf44ff44e5089cc2fbed06e9150"; // your key

useEffect(() => {
  const fetchData = async () => {
    try {
      // Open-Meteo API call for Chennai (latitude, longitude)
      const lat = 13.0827;
      const lon = 80.2707;

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );

      console.log(weatherRes.data);

      // Transform Open-Meteo response to your WeatherData interface
      const current = weatherRes.data.current_weather;
      setWeather({
        name: "Chennai",
        main: { temp: current.temperature, humidity: 70 }, // humidity not provided by Open-Meteo in current_weather, can use dummy value or forecast
        weather: [{ description: `Wind ${current.winddirection}°` }], // Open-Meteo doesn’t give text description, so you can create one
        wind: { speed: current.windspeed },
      });

      // Fetch news
      const newsRes = await axios.get(
        `https://newsapi.org/v2/everything?q=agriculture&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
      );

      setNews(newsRes.data.articles.slice(0, 5));
    } catch (err) {
      console.error("Error fetching Explore data:", err);
      // fallback demo data
      setWeather({
        name: "Demo Village",
        main: { temp: 29, humidity: 65 },
        weather: [{ description: "sunny skies" }],
        wind: { speed: 2.5 },
      });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#43A047" />
        <Text style={styles.loadingText}>Loading Explore...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🌦 Weather */}
      {weather && (
        <View style={styles.card}>
          <Text style={styles.title}>Weather in {weather.name}</Text>
          <Text style={styles.text}>🌡 Temp: {weather.main.temp}°C</Text>
          <Text style={styles.text}>☁️ {weather.weather[0].description}</Text>
          <Text style={styles.text}>💧 Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.text}>🌬 Wind: {weather.wind.speed} m/s</Text>
        </View>
      )}

      {/* 📰 News */}
      <View style={styles.card}>
        <Text style={styles.title}>Latest Farming News</Text>
        {news.length > 0 ? (
          news.map((article, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={styles.newsTitle}>• {article.title}</Text>
              <Text style={styles.newsSource}>
                {article.source.name} | {new Date(article.publishedAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No farming news available.</Text>
        )}
      </View>

      {/* 🌱 Tip of the Day */}
      <View style={[styles.card, styles.tipCard]}>
        <Text style={styles.title}>🌱 Farming Tip of the Day</Text>
        <Text style={styles.text}>
          Use drip irrigation to save up to 60% water while improving crop yield.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FFF2", // light green nature-inspired bg
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6FFF2",
  },
  loadingText: {
    marginTop: 8,
    color: "#333",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32", // deep green
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  newsSource: {
    fontSize: 13,
    color: "#666",
  },
  tipCard: {
    backgroundColor: "#E8F5E9", // soft green
  },
});
