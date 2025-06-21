
import { useState } from 'react';
import { Star, Heart, Eye, Zap, Crown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PremiumPage = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const features = [
    {
      icon: Eye,
      title: "See Who Likes You",
      description: "See all the people who have already liked your profile"
    },
    {
      icon: Heart,
      title: "Unlimited Likes",
      description: "Like as many profiles as you want - no daily limits"
    },
    {
      icon: Zap,
      title: "5 Super Likes per day",
      description: "Stand out with Super Likes that notify matches immediately"
    }
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 29.99,
      period: 'month',
      popular: false,
      savings: null
    },
    {
      id: '6month',
      name: '6 Months',
      price: 19.99,
      period: 'month',
      popular: true,
      savings: '33% OFF'
    },
    {
      id: 'yearly',
      name: '12 Months',
      price: 14.99,
      period: 'month',
      popular: false,
      savings: '50% OFF'
    }
  ];

  const handleUpgrade = (plan: typeof plans[0]) => {
    toast({
      title: "Upgrade Successful! ✨",
      description: `Welcome to LoveMatch Premium - ${plan.name} plan activated!`,
      duration: 4000,
    });
  };

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <div className="premium-gradient w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Upgrade to <span className="text-yellow-600">Premium</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unlimited access to all features and find your perfect match faster
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg card-hover">
                <div className="premium-gradient w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Choose Your Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 shadow-lg transition-all duration-200 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-yellow-500 transform scale-105'
                  : 'hover:shadow-xl'
              } ${plan.popular ? 'border-2 border-yellow-500' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="premium-gradient text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-800">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'premium-gradient text-white hover:opacity-90'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
