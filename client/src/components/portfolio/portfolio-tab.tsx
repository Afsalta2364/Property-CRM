import { useState } from "react";
import { Search, Download, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/use-clients";
import { useProperties } from "@/hooks/use-properties";

export function PortfolioTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { clients } = useClients();
  const { properties } = useProperties();

  const getPropertiesForClient = (clientId: number) => {
    return properties?.filter(property => property.clientId === clientId) || [];
  };

  const getClientTotalValue = (clientId: number) => {
    const clientProperties = getPropertiesForClient(clientId);
    return clientProperties.reduce((sum, property) => sum + parseFloat(property.price), 0);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredClients = clients?.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    // Only show clients with properties
    const hasProperties = getPropertiesForClient(client.id).length > 0;
    return matchesSearch && hasProperties;
  }) || [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <p className="text-gray-600 mt-1">Quick access to client-property relationships</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search portfolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Portfolio Cards */}
      <div className="space-y-6">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No portfolio data found</p>
                <p className="mt-1">
                  {searchQuery 
                    ? "Try adjusting your search query." 
                    : "Add clients with properties to see portfolio data."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const clientProperties = getPropertiesForClient(client.id);
            const totalValue = getClientTotalValue(client.id);
            
            return (
              <Card key={client.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getInitials(client.name)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        {client.company && (
                          <p className="text-gray-600">{client.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(totalValue)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clientProperties.map((property) => (
                      <div
                        key={property.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        {property.imageUrl ? (
                          <img
                            src={property.imageUrl}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                        <h4 className="font-medium text-gray-900 mb-1 truncate">
                          {property.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          {property.address}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary">
                            {formatCurrency(parseFloat(property.price))}
                          </span>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>
                        Properties: <strong>{clientProperties.length}</strong>
                      </span>
                      <span>
                        Last Contact: <strong>{new Date(client.createdAt).toLocaleDateString()}</strong>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Meeting</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
