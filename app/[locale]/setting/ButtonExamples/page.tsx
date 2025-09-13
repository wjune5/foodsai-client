'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Heart, Star, Sparkles, Check, AlertTriangle, X } from 'lucide-react';
import Navigation from '@/shared/components/Navigation';

/**
 * Button Examples Page
 * 
 * This page demonstrates all available button variants and sizes
 * in your unified button system with custom theme.
 */
export default function ButtonExamplesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navigation />
      
      <div className="p-8 space-y-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-pink-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Unified Button System
            </h1>
          </div>

          {/* Standard Variants */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Standard Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          {/* Custom Theme Variants */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Theme Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="cute">
                <Heart className="w-4 h-4" />
                Cute Button
              </Button>
              <Button variant="cuteOutline">
                <Star className="w-4 h-4" />
                Cute Outline
              </Button>
              <Button variant="glass">
                <Sparkles className="w-4 h-4" />
                Glass Effect
              </Button>
              <Button variant="gradient">
                <Sparkles className="w-4 h-4" />
                Gradient
              </Button>
              <Button variant="success">
                <Check className="w-4 h-4" />
                Success
              </Button>
              <Button variant="warning">
                <AlertTriangle className="w-4 h-4" />
                Warning
              </Button>
              <Button variant="error">
                <X className="w-4 h-4" />
                Error
              </Button>
            </div>
          </section>

          {/* Size Variants */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Size Variants</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="cute" size="sm">Small</Button>
              <Button variant="cute" size="default">Default</Button>
              <Button variant="cute" size="lg">Large</Button>
              <Button variant="cute" size="xl">Extra Large</Button>
            </div>
          </section>

          {/* Custom Cute Sizes */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Cute Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="cute" size="cute">Cute</Button>
              <Button variant="cute" size="cuteLg">Cute Large</Button>
              <Button variant="cute" size="cuteXl">Cute XL</Button>
            </div>
          </section>

          {/* Icon Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Icon Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="cute" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="glass" size="icon">
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="gradient" size="icon">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </section>

          {/* Disabled States */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Disabled States</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="cute" disabled>Cute Disabled</Button>
              <Button variant="glass" disabled>Glass Disabled</Button>
              <Button variant="gradient" disabled>Gradient Disabled</Button>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Usage Examples</h2>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30">
              <h3 className="text-lg font-medium mb-4">Common Use Cases</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="cute" size="cuteLg">
                    Primary Action
                  </Button>
                  <Button variant="cuteOutline" size="cuteLg">
                    Secondary Action
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button variant="success" size="sm">
                    Save Changes
                  </Button>
                  <Button variant="error" size="sm">
                    Delete Item
                  </Button>
                  <Button variant="warning" size="sm">
                    Warning Action
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button variant="glass" size="default">
                    Glass Button
                  </Button>
                  <Button variant="gradient" size="default">
                    Gradient Button
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Code Examples</h2>
            <div className="bg-gray-900 text-gray-100 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre>{`// Basic usage
<Button variant="cute">Cute Button</Button>

// With icons
<Button variant="cute">
  <Heart className="w-4 h-4" />
  Cute Button
</Button>

// Different sizes
<Button variant="cute" size="cuteLg">Large Cute</Button>

// Glass effect
<Button variant="glass">Glass Button</Button>

// Gradient
<Button variant="gradient">Gradient Button</Button>

// Status buttons
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>`}</pre>
            </div>
          </section>

          {/* Back to Settings */}
          <div className="flex justify-center pt-8">
            <Button 
              variant="cute" 
              size="cuteLg"
              onClick={() => router.push('/setting')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
