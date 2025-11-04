import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  ArrowRight, Brain, Target, BarChart3, CheckCircle, 
  Sparkles, TrendingUp, Users, X, HeartPulse, Cog, 
  Briefcase, BookOpenText, MessageCircle, ClipboardCheck, 
  ChefHat, Zap, Hammer, Sprout 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "../utils";

interface HighGrowthSector {
  id: string;
  name: string;
  growth_description: string;
  salary_range: string;
  why_growing: string;
}

const InvokeLLM = async () => {
  // Placeholder for your LLM integration
  return {
    sectors: [
      {
        id: '1',
        name: 'Technology',
        growth_description: 'Rapid growth in AI and cloud computing',
        salary_range: '₹8-25 LPA',
        why_growing: 'Digital transformation across industries'
      }
    ]
  };
};

export default function HomePage() {
  const [showNavGuide, setShowNavGuide] = useState<boolean>(false);
const [currentGuideStep, setCurrentGuideStep] = useState<number>(0);
const [highGrowthSectors, setHighGrowthSectors] = useState<HighGrowthSector[] | null>(null);
const [loadingGrowth, setLoadingGrowth] = useState<boolean>(false);

  useEffect(() => {
    // Show guide only on desktop and if user hasn't seen it before
    const hasSeenGuide = localStorage.getItem('careeriq_nav_guide_seen');
    const isDesktop = window.innerWidth >= 1024;
    if (!hasSeenGuide && isDesktop) {
      setTimeout(() => setShowNavGuide(true), 1500);
    }
  }, []);

  const handleCloseGuide = () => {
    setShowNavGuide(false);
    localStorage.setItem('careeriq_nav_guide_seen', 'true');
    setCurrentGuideStep(0);
  };


  const loadHighGrowthSectors = async () => {
    setLoadingGrowth(true);
    try {
      const result = await InvokeLLM({
        prompt: `Identify the top 3 fastest-growing career sectors in India for 2025, specifically for job opportunities and salary growth.

For each sector provide:
- Sector name
- Brief growth description (1 sentence)
- Average salary range in LPA
- Why it's growing (1 sentence)

Focus on Indian market data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sectors: {
              type: "array",
              items: {
                type: "object",                properties: {
                  name: { type: "string" },
                  growth_description: { type: "string" },
                  salary_range: { type: "string" },
                  why_growing: { type: "string" }
                }
              }
            }
          }
        }
      });

            setHighGrowthSectors(result.sectors);
    } catch (error) {
      console.error("Error loading growth sectors:", error);
    }
    setLoadingGrowth(false);
  };

  useEffect(() => {
    loadHighGrowthSectors();
  }, []);

  const navigationGuideSteps = [
    {
      icon: Brain,
      title: "Welcome to CareerIQ!",
      description: "Hover over the icons at the top to discover all our features",
      highlight: "all"
    },
    {
      icon: Target,
      title: "Explore Career Options",      description: "Browse careers by sector: Medical, Engineering, Business, Teaching",
      highlight: "sectors"
    },
    {
      icon: MessageCircle,
      title: "Get Personalized Help",
      description: "Use Career Advisor, Skill Tests, and Industry Trends for deep insights",
      highlight: "tools"
    }
  ];

    const stats = [
    { number: "100+", label: "Career Options", icon: Target },
    { number: "24", label: "Assessment Questions", icon: Brain },
    { number: "7", label: "Happiness Dimensions", icon: Sparkles },
    { number: "6+", label: "Skill Tests", icon: BarChart3 }
  ];

  const popularCareers = [
    {
      title: "Software Engineer",
      sector: "Technology",
           icon: Brain,
      color: "from-blue-500 to-indigo-500",
      avgSalary: "₹8-15L",
      description: "Build innovative software solutions"
    },
    {
      title: "Doctor",
      sector: "Healthcare",
      icon: HeartPulse,
      color: "from-red-500 to-pink-500",
           avgSalary: "₹10-25L",
      description: "Save lives and improve health"
    },
    {
      title: "Chef",
      sector: "Culinary",
      icon: ChefHat,
      color: "from-orange-500 to-amber-500",
      avgSalary: "₹4-12L",
      description: "Create culinary masterpieces"
    },
        {
      title: "Electrician",
      sector: "Skilled Trades",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      avgSalary: "₹3-8L",
      description: "Power homes and businesses"
    }
  ];

  
  const careerCategories = [
    "Technology & IT",
    "Healthcare & Medicine",
    "Engineering (10+ types)",
    "Business & Finance",
    "Education & Teaching",
    "Creative Arts & Design",
    "Skilled Trades",
    "Hospitality & Culinary",
    "Agriculture & Environment"
  ];

    return (
    <div className="bg-slate-50">
      {/* Navigation Guide Overlay for Desktop */}
      <AnimatePresence>
        {showNavGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 hidden lg:block"
              onClick={handleCloseGuide}
                          />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 hidden lg:block"
            >
              <Card className="w-96 border-2 border-teal-500 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                           {React.createElement(navigationGuideSteps[currentGuideStep].icon, { className: "w-6 h-6 text-teal-600" })}
                    </div>
                    <button
                      onClick={handleCloseGuide}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {navigationGuideSteps[currentGuideStep].title}
                                   </h3>
                  <p className="text-slate-600 mb-6">
                    {navigationGuideSteps[currentGuideStep].description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {navigationGuideSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 w-2 rounded-full ${
                            index === currentGuideStep ? 'bg-teal-500' : 'bg-slate-300'
                                                   }`}
                        />
                      ))}
                    </div>
                    
                    {currentGuideStep < navigationGuideSteps.length - 1 ? (
                      <Button
                        onClick={() => setCurrentGuideStep(prev => prev + 1)}
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        Next
                                             <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCloseGuide}
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        Got it!
                      </Button>
                    )}
                  </div>
                               </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-8 tech-label">
            <Brain className="w-4 h-4" />
            ai-powered career matching
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Find careers aligned with
            <span className="block text-teal-600 mt-2">who you are</span>
          </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
            Take a 7-minute comprehensive assessment and discover careers that match your traits,
            with real salary and work-life balance data from the Indian market.
          </p>

          <p className="text-lg text-slate-500 mb-12">
            Explore <strong className="text-teal-600">100+ careers</strong> from Software Engineer to Chef, Doctor to Electrician
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("Quiz")}>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Assessment
                                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button
              onClick={() => setShowNavGuide(true)}
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 px-8 py-6 text-lg rounded-2xl hover:bg-slate-50 hidden lg:inline-flex"
            >
              <Brain className="w-5 h-5 mr-2" />
              Show Navigation Guide
            </Button>
          </div>
                 </motion.div>
      </section>

      {/* Popular Careers in India */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Popular Careers in India
            </h2>
            <p className="text-lg text-slate-600">
              Explore diverse career paths across sectors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCareers.map((career, index) => (
              <Link key={index} to={`${createPageUrl("CareerInsights")}?search=${encodeURIComponent(career.title)}`}>
                <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${career.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <career.icon className="w-8 h-8 text-white" />
                  </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{career.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{career.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">{career.sector}</span>
                    <span className="text-sm font-bold text-teal-600">{career.avgSalary}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>


     {/* High-Growth Sectors */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4 tech-label">
              <TrendingUp className="w-4 h-4" />
              live market insights
                          </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Fastest Growing Sectors in India
            </h2>
            <p className="text-lg text-slate-600">
              Where job opportunities and salaries are booming
            </p>
          </motion.div>


          {loadingGrowth ? (
            <div className="text-center py-12">              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 mx-auto mb-4" />
              <p className="text-slate-600">Fetching latest market data...</p>
            </div>
          ) : highGrowthSectors ? (
            <div className="grid md:grid-cols-3 gap-6">
              {highGrowthSectors.map((sector: HighGrowthSector, index: number) => (
                <motion.div
                  key={sector.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                                      <Card className="border-2 border-teal-200 shadow-xl rounded-2xl h-full hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
               … <h3 className="text-xl font-bold text-slate-900">{sector.name}</h3>
                      </div>
                      <p className="text-slate-700 mb-3">{sector.growth_description}</p>
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-3">
                        <p className="text-sm font-mono text-slate-600 mb-1">Salary Range</p>
                        <p className="text-lg font-bold text-teal-700">{sector.salary_range}</p>
                      </div>
                                            <p className="text-sm text-slate-600 italic">{sector.why_growing}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : null}

          <div className="text-center mt-8">
            <Link to={createPageUrl("Trends")}>
              <Button variant="outline" className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50 rounded-xl px-6 py-3">
                View Detailed Industry Trends
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards - Desktop Only */}
      <section className="bg-white border-y border-slate-200 py-16 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Explore by Sector</h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { title: "Medical Careers", icon: HeartPulse, url: "MedicalCareer", color: "from-red-500 to-pink-500" },
              { title: "Engineering", icon: Cog, url: "EngineeringCareer", color: "from-blue-500 to-indigo-500" },
              { title: "Business", icon: Briefcase, url: "BusinessCareer", color: "from-purple-500 to-pink-500" },
              { title: "Teaching", icon: BookOpenText, url: "TeachingCareer", color: "from-green-500 to-teal-500" }
            ].map((sector, index) => (
              <Link key={index} to={createPageUrl(sector.url)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                  className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={`bg-gradient-to-br ${sector.color} p-8 text-white`}>
                    <sector.icon className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold">{sector.title}</h3>
                    <p className="text-sm opacity-90 mt-2">Explore careers →</p>
                  </div>
                </motion.div>
              </Link>
            ))}
            </div>
        </div>
        </section>
        {/* Stats Section */}
      <section className="bg-white border-y border-slate-200 py-16 lg:border-y-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
                        <p className="text-lg text-slate-600">
              Simple, scientific, and tailored for Indian professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                step: "01",
                title: "Take the comprehensive assessment",
                                description: "Answer 24 questions about your personality, work style, and what makes you happy in a career (~7 minutes)."
              },
              {
                icon: Brain,
                step: "02",
                title: "Get your AI profile",
                description: "We analyze your responses across 10 personality traits and 7 happiness dimensions."
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Explore 100+ careers",
                                description: "See ranked matches with stress, salary (LPA), work-life balance, and personalized happiness scores."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 border-2 border-slate-200"
              >
                               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="tech-label text-slate-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
       {/* Career Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Careers Across All Sectors
            </h2>

            <p className="text-lg text-slate-600">
              From tech to trades, healthcare to hospitality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center hover:border-teal-300 hover:bg-teal-50 transition-all"
              >
                <p className="font-semibold text-slate-900">{category}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-2 border-slate-200"
          >
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                  Built for India
                </h3>
                <div className="space-y-4">
                  {[
                    "Salary data in LPA (Lakhs Per Annum)",
                    "100+ careers including vocational options",
                    "Indian market-specific insights",
                    "Real stress and work-life balance data",
                    "Live market trends from the web"
                  ].map((feature, index) => (                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                      <p className="text-slate-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">
                  Science-backed matching
                </h3>
                                <div className="space-y-4">
                  {[
                    "24-question comprehensive assessment",
                    "10 personality trait dimensions",
                    "7 job happiness factors",
                    "Weighted career matching algorithm",
                    "Customizable priority sliders",
                    "Mini skill tests to validate abilities"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                                           <p className="text-slate-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
            <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <Users className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              For Everyone
            </h2>
                       <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Whether you're a college student exploring options, a professional considering a career change,
              or someone looking to validate your current path – CareerIQ provides personalized guidance
              based on who you really are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to find your perfect career?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of professionals who discovered their ideal path
                          </p>
            <Link to={createPageUrl("Quiz")}>
              <Button className="bg-white text-teal-700 hover:bg-slate-100 px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                Start your assessment now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
    );
}
