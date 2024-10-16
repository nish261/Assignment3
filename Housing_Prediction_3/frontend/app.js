import { useState, useEffect } from 'react';
import { ChevronDown, Database, Home, PieChart, TrendingUp, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [suburb, setSuburb] = useState('');
  const [year, setYear] = useState('');

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedDatabase(null);
    setPredictionResult(null);
    window.scrollTo(0, 0);
  };

  const showDatabase = (db) => {
    setSelectedDatabase(db);
  };

  const predictPrice = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/predict', { locality: suburb, year: parseInt(year) });
      setPredictionResult(response.data.predicted_price);

      // Append to chart data
      const newChartData = chartData || {
        labels: [],
        datasets: [{ label: 'Predicted Prices', data: [] }],
      };

      newChartData.labels.push(year);
      newChartData.datasets[0].data.push(response.data.predicted_price);
      setChartData(newChartData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-section').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-soft-lavender flex flex-col">
      <header className="bg-deep-purple text-white sticky top-0 z-10 shadow-md bg-opacity-100" style={{ backdropFilter: 'none' }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigateTo('home')} className="flex items-center">
                <Home className="h-8 w-8 text-white mr-2" />
                <span className="text-xl font-semibold text-white">Melbourne Housing</span>
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <button onClick={() => navigateTo('home')} className="text-golden-yellow hover:text-white transition-colors">
                Home
              </button>
              <button onClick={() => navigateTo('data')} className="text-golden-yellow hover:text-white transition-colors">
                Data
              </button>
              <button onClick={() => navigateTo('predict')} className="text-golden-yellow hover:text-white transition-colors">
                Predict
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {currentPage === 'home' && (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-4xl font-bold text-midnight-blue mb-4">Melbourne Housing Price Predictor</h1>
              <p className="text-midnight-blue mb-8">
                Our advanced machine learning model analyzes historical sales data to provide accurate price forecasts for properties in Melbourne.
              </p>
              <Image src="/placeholder.svg?height=400&width=800" alt="Melbourne Housing Market" width={800} height={400} className="rounded-lg shadow-lg mb-8" />
            </div>
          </div>
        )}

        {currentPage === 'data' && (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-3xl font-bold text-midnight-blue mb-4">Data Exploration</h1>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Button onClick={() => showDatabase('property_sales')} variant="outline" className="h-auto py-4 bg-white text-deep-purple hover:bg-warm-orange hover:text-white transition-colors">
                  <Database className="h-6 w-6 mr-2" />
                  Property Sales
                </Button>
                <Button onClick={() => showDatabase('kaggle')} variant="outline" className="h-auto py-4 bg-white text-deep-purple hover:bg-warm-orange hover:text-white transition-colors">
                  <Database className="h-6 w-6 mr-2" />
                  Kaggle Dataset
                </Button>
                <Button onClick={() => showDatabase('open_portal')} variant="outline" className="h-auto py-4 bg-white text-deep
