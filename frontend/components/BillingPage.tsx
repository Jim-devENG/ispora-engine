import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💎</span>
            </div>
            <Badge className="bg-blue-600 text-white">
              Community Explorer
            </Badge>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Support Youth-Led Innovation
            </h1>
            <p className="text-xl text-gray-600 mt-2 max-w-3xl mx-auto">
              Join thousands of diaspora professionals building the future. Explore for free or 
              support our mission for just $5/month to unlock community building powers.
            </p>
          </div>
        </div>

        {/* Trial Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900">
              Welcome to Ispora! You're in your free trial period
            </h3>
            <p className="text-green-700 mt-1">
              You have <span className="font-semibold">60 days</span> of full access to explore all features.
              After your trial, you can continue with our generous free plan or support the community for just $5/month.
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          
          {/* Community Explorer Plan */}
          <Card className="border-blue-200">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <span className="text-4xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Community Explorer</h3>
                    <p className="text-gray-600 mt-2">Perfect for discovering opportunities and connecting with the diaspora community</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-gray-900">Free</div>
                  <p className="text-green-600 font-medium">Always free, no strings attached</p>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Full community access</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Discover unlimited projects & opportunities</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Connect with diaspora professionals</span>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Builder Plan */}
          <Card className="border-green-300 ring-2 ring-green-100 scale-105 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                💚 Support Our Mission
              </Badge>
            </div>
            
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Pro Builder</h3>
                    <p className="text-gray-600 mt-2">Support our mission and unlock full community building powers</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">$5</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      Support youth-led innovation across the diaspora
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Everything in Community Explorer</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Host unlimited projects & initiatives</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Provide mentorship to community</span>
                  </div>
                </div>
                
                <Button className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90 text-white">
                  💚 Support for $5/month
                </Button>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    🌱 Your support helps fund youth-led innovation
                  </p>
                  <p className="text-xs text-gray-500">
                    Every Pro Builder membership supports 2-3 youth projects across the diaspora
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-lg p-8 text-center space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            Built by the Community, for the Community
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <p className="font-semibold text-gray-900">100% Transparent</p>
              <p className="text-sm text-gray-600">All funds support youth projects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <p className="font-semibold text-gray-900">54 Countries</p>
              <p className="text-sm text-gray-600">Global diaspora network</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p className="font-semibold text-gray-900">500+ Projects</p>
              <p className="text-sm text-gray-600">Youth-led initiatives funded</p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💎</div>
                <p className="text-green-100 text-sm font-medium">Your Impact Points</p>
                <p className="text-3xl font-bold mt-1">11,250</p>
                <p className="text-green-100 text-sm mt-1">Community contribution</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🌍</div>
                <p className="text-gray-500 text-sm font-medium">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 mt-1">Community Explorer</p>
                <p className="text-green-600 text-sm mt-1">Always Free</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 text-sm font-medium">Community Since</p>
                <p className="text-xl font-bold text-gray-900 mt-1">Jan 15, 2024</p>
                <p className="text-purple-600 text-sm mt-1">Diaspora member</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🤝</div>
                <p className="text-gray-500 text-sm font-medium">Global Network</p>
                <p className="text-xl font-bold text-gray-900 mt-1">28</p>
                <p className="text-blue-600 text-sm mt-1">Active connections</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}