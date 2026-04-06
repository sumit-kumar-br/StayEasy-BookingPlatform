export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxOccupancy: number;
  pricePerNight: number;
  totalRooms: number;
  bedConfiguration: string;
  photoUrl?: string;
}

export interface CreateRoomTypeRequest {
  name: string;
  description: string;
  maxOccupancy: number;
  pricePerNight: number;
  totalRooms: number;
  bedConfiguration: string;
}
