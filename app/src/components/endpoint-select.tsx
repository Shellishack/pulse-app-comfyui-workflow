import React from "react";
import { Select, SelectItem } from "@heroui/react";

export default function EndpointSelect({
  availableEndpoints,
  endpoint,
  setEndpoint,
}: {
  availableEndpoints: string[];
  endpoint: string | undefined;
  setEndpoint: (value: string) => void;
}) {
  return (
    <Select selectedKeys={endpoint ? [endpoint] : []} label="Endpoint" classNames={{
      trigger: "min-h-10 h-10"
    }}>
      {availableEndpoints.map((endpoint) => (
        <SelectItem key={endpoint} onPress={() => setEndpoint(endpoint)}>
          {endpoint}
        </SelectItem>
      ))}
    </Select>
  );
}
