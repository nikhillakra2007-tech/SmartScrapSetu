import { CollectorPickup, Transaction } from "./collector-types";
import { MOCK_COLLECTOR_ID } from "./collector-service";

const today = new Date();
const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM
const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

// Helper to create dates relative to today
const createDate = (daysOffset: number, hours: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_MOCK_PICKUPS: CollectorPickup[] = [
  {
    id: "pickup-1",
    customer_name: "Rahul Sharma",
    customer_phone: "+91 98112 34567",
    pickup_address: "Flat 402, Mayur Vihar Phase-1, East Delhi",
    status: "REQUESTED",
    scheduled_time: null,
    requested_time: createDate(0, 10), // today 10am
    expected_material: "E-Waste (Laptops, Cables)",
    estimated_quantity_kg: 6.5,
    estimated_value_min: 400,
    estimated_value_max: 600,
    created_at: createDate(-1, 15),
  },
  {
    id: "pickup-2",
    customer_name: "TechPark IT Admin",
    customer_phone: "+91 99990 12345",
    pickup_address: "TechPark Tower B, Okhla Industrial Area Ph-2",
    status: "SCHEDULED",
    scheduled_time: createDate(0, 14), // today 2pm
    requested_time: createDate(0, 14),
    expected_material: "Server PSUs, Heavy Wiring",
    estimated_quantity_kg: 85.0,
    estimated_value_min: 8000,
    estimated_value_max: 12000,
    created_at: createDate(-2, 9),
  },
  {
    id: "pickup-3",
    customer_name: "Anjali Gupta",
    customer_phone: "+91 98710 99881",
    pickup_address: "Pocket B, Dilshad Garden, Shahdara",
    status: "SCHEDULED",
    scheduled_time: createDate(1, 11), // tomorrow 11am
    requested_time: createDate(1, 11),
    expected_material: "CRT TV, Old UPS Battery",
    estimated_quantity_kg: 22.0,
    estimated_value_min: 800,
    estimated_value_max: 1200,
    created_at: createDate(-1, 18),
  },
];

export const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    pickup_id: "past-pickup-1",
    collector_id: MOCK_COLLECTOR_ID,
    actual_quantity_kg: 14.2,
    actual_value: 6390,
    transaction_date: createDate(-2, 16), // 2 days ago
    created_at: createDate(-2, 16),
    items: [
      { id: "item-1", material_category: "Printed Circuit Boards", quantity_kg: 14.2, value: 6390 }
    ]
  },
  {
    id: "tx-2",
    pickup_id: "past-pickup-2",
    collector_id: MOCK_COLLECTOR_ID,
    actual_quantity_kg: 28.5,
    actual_value: 5130,
    transaction_date: createDate(-5, 11), // 5 days ago
    created_at: createDate(-5, 11),
    items: [
      { id: "item-2", material_category: "Batteries", quantity_kg: 28.5, value: 5130 }
    ]
  },
  // Add a transaction from last month to show MoM comparison
  {
    id: "tx-3",
    pickup_id: "past-pickup-3",
    collector_id: MOCK_COLLECTOR_ID,
    actual_quantity_kg: 45.0,
    actual_value: 15000,
    transaction_date: createDate(-40, 10), // Last month
    created_at: createDate(-40, 10),
    items: [
      { id: "item-3", material_category: "Cables & Wires", quantity_kg: 45.0, value: 15000 }
    ]
  }
];
