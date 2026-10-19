import mongoose from 'mongoose';
import { Room, IRoom, RoomStatus } from '../models/Room.js';
import { RoomType } from '../models/RoomType.js';
import { AuditLog } from '../models/AuditLog.js';
import { PaginationParams } from '../utils/pagination.js';

export interface RoomFilterParams {
  status?: string;
  roomType?: string;
  floor?: number | string;
  capacity?: number | string;
  search?: string;
}

export interface CreateRoomDTO {
  roomNumber: string;
  roomType: string;
  floor: number;
  pricePerNight: number;
  capacity?: number;
  amenities?: string[];
  images?: string[];
  description?: string;
  bedType?: string;
  sizeSqFt?: number;
  status?: RoomStatus;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}

export interface UpdateRoomDTO {
  roomNumber?: string;
  roomType?: string;
  floor?: number;
  pricePerNight?: number;
  capacity?: number;
  amenities?: string[];
  images?: string[];
  description?: string;
  bedType?: string;
  sizeSqFt?: number;
  status?: RoomStatus;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}

export class RoomService {
  static async getAllRooms(
    filters: RoomFilterParams,
    pagination: PaginationParams
  ): Promise<{ rooms: IRoom[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.roomType && filters.roomType !== 'All') {
      if (mongoose.Types.ObjectId.isValid(filters.roomType)) {
        query.roomType = filters.roomType;
      } else {
        const typeDoc = await RoomType.findOne({ name: filters.roomType });
        if (typeDoc) {
          query.roomType = typeDoc._id;
        }
      }
    }

    if (filters.floor && filters.floor !== 'All') {
      query.floor = parseInt(filters.floor.toString(), 10);
    }

    if (filters.capacity) {
      query.capacity = { $gte: parseInt(filters.capacity.toString(), 10) };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { roomNumber: searchRegex },
        { description: searchRegex },
        { bedType: searchRegex },
        { amenities: searchRegex },
      ];
    }

    const [total, rooms] = await Promise.all([
      Room.countDocuments(query),
      Room.find(query)
        .populate('roomType')
        .populate('currentGuest', 'firstName lastName phone email vip avatar')
        .populate('currentBooking', 'bookingId checkInDate checkOutDate totalAmount paidAmount bookingStatus')
        .sort({ [pagination.sortBy]: pagination.sortOrder })
        .skip(pagination.skip)
        .limit(pagination.limit),
    ]);

    return { rooms, total };
  }

  static async getRoomById(id: string): Promise<IRoom | null> {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { roomNumber: id }] }
      : { roomNumber: id };

    return Room.findOne(query)
      .populate('roomType')
      .populate('currentGuest', 'firstName lastName phone email vip avatar address nationality idType idNumber')
      .populate('currentBooking', 'bookingId checkInDate checkOutDate totalAmount paidAmount balanceAmount paymentStatus bookingStatus');
  }

  static async createRoom(dto: CreateRoomDTO): Promise<IRoom> {
    const existing = await Room.findOne({ roomNumber: dto.roomNumber.trim() });
    if (existing) {
      throw new Error(`Room number '${dto.roomNumber}' is already in use`);
    }

    // Resolve room type ObjectId if name is given
    let roomTypeId = dto.roomType;
    if (!mongoose.Types.ObjectId.isValid(dto.roomType)) {
      let foundType = await RoomType.findOne({ name: new RegExp(`^${dto.roomType.trim()}$`, 'i') });
      if (!foundType) {
        foundType = await RoomType.create({
          name: dto.roomType.trim(),
          basePrice: dto.pricePerNight || 5500,
          capacity: dto.capacity || 2,
          description: `${dto.roomType.trim()} luxury room tier`,
          status: 'ACTIVE',
        });
      }
      roomTypeId = foundType._id.toString();
    } else {
      const typeExists = await RoomType.findById(dto.roomType);
      if (!typeExists) {
        throw new Error(`Room type with ID '${dto.roomType}' does not exist`);
      }
    }

    const room = await Room.create({
      roomNumber: dto.roomNumber.trim(),
      roomType: roomTypeId,
      floor: dto.floor,
      pricePerNight: dto.pricePerNight,
      capacity: dto.capacity || 2,
      amenities: dto.amenities || [],
      images: dto.images || [],
      description: dto.description || '',
      bedType: dto.bedType || 'King Bed',
      sizeSqFt: dto.sizeSqFt || 350,
      status: dto.status || 'AVAILABLE',
    });

    await room.populate('roomType');

    if (dto.userId) {
      await AuditLog.create({
        user: dto.userId as any,
        userName: dto.userName || 'Staff',
        action: 'Created Room',
        module: 'Rooms',
        entityId: room._id.toString(),
        details: `Created new Room ${room.roomNumber} (${dto.status || 'AVAILABLE'}) on Floor ${room.floor}`,
        ipAddress: dto.ipAddress || '',
      });
    }

    return room;
  }

  static async updateRoom(id: string, dto: UpdateRoomDTO): Promise<IRoom> {
    const room = await this.getRoomById(id);
    if (!room) {
      throw new Error(`Room not found with ID '${id}'`);
    }

    // Check duplicate room number if changing
    if (dto.roomNumber && dto.roomNumber.trim() !== room.roomNumber) {
      const duplicate = await Room.findOne({
        roomNumber: dto.roomNumber.trim(),
        _id: { $ne: room._id },
      });
      if (duplicate) {
        throw new Error(`Room number '${dto.roomNumber}' already exists`);
      }
      room.roomNumber = dto.roomNumber.trim();
    }

    if (dto.roomType) {
      if (mongoose.Types.ObjectId.isValid(dto.roomType)) {
        room.roomType = dto.roomType as any;
      } else {
        const foundType = await RoomType.findOne({ name: dto.roomType });
        if (foundType) {
          room.roomType = foundType._id as any;
        }
      }
    }

    if (dto.floor !== undefined) room.floor = dto.floor;
    if (dto.pricePerNight !== undefined) room.pricePerNight = dto.pricePerNight;
    if (dto.capacity !== undefined) room.capacity = dto.capacity;
    if (dto.amenities) room.amenities = dto.amenities;
    if (dto.images) room.images = dto.images;
    if (dto.description !== undefined) room.description = dto.description;
    if (dto.bedType !== undefined) room.bedType = dto.bedType;
    if (dto.sizeSqFt !== undefined) room.sizeSqFt = dto.sizeSqFt;

    if (dto.status) {
      room.status = dto.status;
      if (dto.status === 'AVAILABLE') {
        room.currentGuest = null;
        room.currentBooking = null;
      }
    }

    await room.save();
    await room.populate(['roomType', 'currentGuest', 'currentBooking']);

    if (dto.userId) {
      await AuditLog.create({
        user: dto.userId as any,
        userName: dto.userName || 'Staff',
        action: 'Updated Room',
        module: 'Rooms',
        entityId: room._id.toString(),
        details: `Updated specifications and configuration for Room ${room.roomNumber}`,
        ipAddress: dto.ipAddress || '',
      });
    }

    return room;
  }

  static async updateRoomStatus(
    id: string,
    status: RoomStatus,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<IRoom> {
    const room = await this.getRoomById(id);
    if (!room) {
      throw new Error(`Room not found with ID '${id}'`);
    }

    const prevStatus = room.status;
    room.status = status;

    if (status === 'AVAILABLE') {
      room.currentGuest = null;
      room.currentBooking = null;
    }

    await room.save();
    await room.populate(['roomType', 'currentGuest', 'currentBooking']);

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Staff',
        action: 'Updated Room Status',
        module: 'Rooms',
        entityId: room._id.toString(),
        details: `Changed status of Room ${room.roomNumber} from ${prevStatus} to ${status}`,
        ipAddress: ipAddress || '',
      });
    }

    return room;
  }

  static async deleteRoom(
    id: string,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<{ message: string; roomNumber: string }> {
    const room = await this.getRoomById(id);
    if (!room) {
      throw new Error(`Room not found with ID '${id}'`);
    }

    if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {
      throw new Error(
        `Cannot delete Room ${room.roomNumber} while its status is '${room.status}'. Please release room inventory first.`
      );
    }

    const roomNumber = room.roomNumber;
    await Room.findByIdAndDelete(room._id);

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Staff',
        action: 'Deleted Room',
        module: 'Rooms',
        entityId: room._id.toString(),
        details: `Deleted Room ${roomNumber} from system inventory`,
        ipAddress: ipAddress || '',
      });
    }

    return {
      message: `Room ${roomNumber} has been deleted successfully`,
      roomNumber,
    };
  }
}
