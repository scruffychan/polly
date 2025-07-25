import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CountrySelectorProps {
  onCountryChange: (country: string) => void;
}

export default function CountrySelector({ onCountryChange }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState("US");

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
  ];

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    onCountryChange(countryCode);
  };

  const currentCountry = countries.find(c => c.code === selectedCountry);

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <i className="fas fa-globe text-blue-600"></i>
              <span className="text-sm font-medium text-blue-800">Location-Based Resources</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-blue-700">
              <span>{currentCountry?.flag}</span>
              <span>{currentCountry?.name}</span>
            </div>
          </div>
          
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center space-x-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Civic action items are customized for your location. In production, location would be detected automatically.
        </p>
      </CardContent>
    </Card>
  );
}