import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type Crop = {
  id: string;
  name: string;
  variety?: string;
  sowingDate: string;
  landSize: number;
  landUnit: 'acres' | 'hectares';
  location?: string;
};

type DailyForecast = {
  date: string;
  tmax: number;
  tmin: number;
  rain: number; // mm
  wind: number; // km/h (derived)
};

export default function ExplorePage() {
  const navigation = useNavigation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const WEATHER_API_KEY = "hi"; // your key
  const NEWS_API_KEY = "d08e9cf44ff44e5089cc2fbed06e9150"; // your key

useEffect(() => {
  const fetchData = async () => {
    try {
      // Load crops from storage
      const savedCrops = await AsyncStorage.getItem('farmerCrops');
      if (savedCrops) setCrops(JSON.parse(savedCrops));

      // Open-Meteo API call for Chennai (latitude, longitude)
      const lat = 13.0827;
      const lon = 80.2707;

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`
      );

      // Transform Open-Meteo response to your WeatherData interface
      const current = weatherRes.data.current_weather;
      setWeather({
        name: "Chennai",
        main: { temp: current.temperature, humidity: 70 }, // humidity not provided by Open-Meteo in current_weather, can use dummy value or forecast
        weather: [{ description: `Wind ${current.winddirection}°` }], // Open-Meteo doesn’t give text description, so you can create one
        wind: { speed: current.windspeed },
      });

      // Build 7-day forecast
      const daily = weatherRes.data.daily;
      if (daily) {
        const fc: DailyForecast[] = daily.time.map((d: string, i: number) => ({
          date: d,
          tmax: daily.temperature_2m_max[i],
          tmin: daily.temperature_2m_min[i],
          rain: daily.precipitation_sum[i],
          wind: Math.round((daily.wind_speed_10m_max[i] || 0) * 3.6), // m/s -> km/h if needed (open-meteo daily is usually km/h already)
        }));
        setForecast(fc);
      }

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

const pickIcon = (advice: string) => {
  if (advice.toLowerCase().includes('irrigat')) return 'water';
  if (advice.toLowerCase().includes('fertil')) return 'leaf';
  if (advice.toLowerCase().includes('pest')) return 'bug';
  if (advice.toLowerCase().includes('harvest')) return 'cut';
  return 'information-circle';
};

const todayAdviceForCrop = (crop: Crop): string[] => {
  if (!weather || forecast.length === 0) return ['Weather data unavailable.'];
  const today = forecast[0];
  const tips: string[] = [];
  if (today.rain >= 10) tips.push('Rain expected today: avoid irrigation.');
  if (today.tmax >= 35) tips.push('High heat: prefer early morning or evening field work.');
  if (today.wind >= 30) tips.push('Strong winds: avoid pesticide spraying today.');
  if (tips.length === 0) tips.push('Favorable weather: proceed with regular operations.');
  // Crop-specific nuance
  if (crop.name.toLowerCase() === 'wheat' && today.tmin < 12) tips.push('Cool night: monitor for rust; scout in morning.');
  if (crop.name.toLowerCase() === 'rice' && today.rain >= 5) tips.push('Maintain water level, check field bunds.');
  return tips;
};

const longTermAdviceForCrop = (crop: Crop): string[] => {
  if (forecast.length === 0) return [];
  const next7 = forecast.slice(0, 7);
  const totalRain = next7.reduce((s, d) => s + (d.rain || 0), 0);
  const hotDays = next7.filter(d => d.tmax >= 35).length;
  const windyDays = next7.filter(d => d.wind >= 30).length;
  const tips: string[] = [];
  if (totalRain >= 20) tips.push('Heavy rainfall week: plan fertilizer top-dressing after rains.');
  if (hotDays >= 3) tips.push('Multiple hot days ahead: adjust irrigation frequency and mulching.');
  if (windyDays >= 2) tips.push('Windy spell: schedule spraying on calmer mornings.');
  if (tips.length === 0) tips.push('Stable week ahead: follow your crop calendar.');
  // Crop nuance
  if (crop.name.toLowerCase() === 'wheat') tips.push('Wheat: maintain 10–12 day irrigation interval if no rain.');
  if (crop.name.toLowerCase() === 'rice') tips.push('Rice: maintain 5–7cm standing water; drain before top-dress.');
  return tips;
};


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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any)?.openDrawer?.()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌿 Explore</Text>
        <View style={{ width: 22 }} />
      </View>
      {/* 🌦 Weather (Professional) */}
      {weather && (
        <View style={[styles.card, styles.weatherCard]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.weatherLoc}>{weather.name}</Text>
              <Text style={styles.weatherDate}>{new Date().toLocaleDateString()}</Text>
            </View>
            <Ionicons name="partly-sunny" size={28} color="#2E7D32" />
          </View>

          <View style={styles.weatherMainRow}>
            <Text style={styles.weatherTemp}>{Math.round(weather.main.temp)}°</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
              {forecast[0] && (
                <Text style={styles.weatherHiLo}>H {Math.round(forecast[0].tmax)}°  L {Math.round(forecast[0].tmin)}°</Text>
              )}
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Ionicons name="water" size={16} color="#1B5E20" />
              <Text style={styles.metricText}>{forecast[0] ? `${Math.round(forecast[0].rain)} mm` : '--'}</Text>
              <Text style={styles.metricLabel}>Precip</Text>
            </View>
            <View style={styles.metricBox}>
              <Ionicons name="speedometer" size={16} color="#1B5E20" />
              <Text style={styles.metricText}>{Math.round((weather.wind.speed || 0) * 3.6)} km/h</Text>
              <Text style={styles.metricLabel}>Wind</Text>
            </View>
            <View style={styles.metricBox}>
              <Ionicons name="water-outline" size={16} color="#1B5E20" />
              <Text style={styles.metricText}>{weather.main.humidity}%</Text>
              <Text style={styles.metricLabel}>Humidity</Text>
            </View>
          </View>

          {forecast.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {forecast.slice(0, 7).map((d, idx) => (
                <View key={d.date} style={styles.dayChip}>
                  <Text style={styles.dayText}>{idx === 0 ? 'Today' : new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</Text>
                  <Text style={styles.dayHiLo}>{Math.round(d.tmax)}°/{Math.round(d.tmin)}°</Text>
                  <View style={styles.dayRow}><Ionicons name="water" size={14} color="#2E7D32" /><Text style={styles.dayMetric}>{Math.round(d.rain)}mm</Text></View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* 🌾 Weather-based Suggestions per Crop */}
      <View style={styles.card}>
        <Text style={styles.title}>Smart Weather Suggestions</Text>
        {crops.length === 0 ? (
          <Text style={styles.text}>Add crops in My Crops to see tailored advice.</Text>
        ) : (
          crops.map((crop) => (
            <View key={crop.id} style={styles.cropAdviceCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cropTitle}>{crop.name}{crop.variety ? ` • ${crop.variety}` : ''}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>Today</Text></View>
              </View>
              {todayAdviceForCrop(crop).map((a, i) => (
                <View key={i} style={styles.adviceRow}>
                  <Ionicons name={pickIcon(a) as any} size={16} color="#2E7D32" />
                  <Text style={styles.adviceText}>{a}</Text>
                </View>
              ))}

              <View style={[styles.rowBetween, { marginTop: 10 }]}>
                <Text style={styles.subTitle}>Next 7 Days</Text>
              </View>
              {longTermAdviceForCrop(crop).map((a, i) => (
                <View key={i} style={styles.adviceRow}>
                  <Ionicons name={pickIcon(a) as any} size={16} color="#1B5E20" />
                  <Text style={styles.adviceText}>{a}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

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
  header: { backgroundColor: '#2E7D32', padding: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: -16, marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
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
  weatherCard: { backgroundColor: '#ffffff' },
  weatherLoc: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  weatherDate: { fontSize: 12, color: '#777' },
  weatherMainRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  weatherTemp: { fontSize: 44, fontWeight: '800', color: '#1B5E20' },
  weatherDesc: { fontSize: 14, color: '#333' },
  weatherHiLo: { fontSize: 12, color: '#666', marginTop: 2 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  metricBox: { alignItems: 'center', flex: 1 },
  metricText: { fontSize: 14, color: '#1B5E20', fontWeight: '700', marginTop: 4 },
  metricLabel: { fontSize: 12, color: '#666' },
  dayChip: { width: 72, borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  dayText: { fontSize: 12, color: '#666' },
  dayHiLo: { fontSize: 13, color: '#2E7D32', fontWeight: '700', marginTop: 2 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dayMetric: { fontSize: 12, color: '#333' },
  cropAdviceCard: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 12, marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cropTitle: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#2E7D32', fontWeight: '700', fontSize: 12 },
  adviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  adviceText: { fontSize: 14, color: '#333', flex: 1 },
  subTitle: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
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
