import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { ActorModel } from './actor.model';
import { ActorDto } from './dto/actor.dto';

@Injectable()
export class ActorService {
  constructor(
    @InjectModel(ActorModel) private readonly actorModel: ModelType<ActorModel>,
  ) {}

  async bySlug(slug: string) {
    const doc = await this.actorModel.findOne({ slug }).exec();
    if (!doc) throw new NotFoundException('actor not found');
    return doc;
  }

  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm)
      options = {
        $or: [
          {
            name: new RegExp(searchTerm, 'i'),
          },
          {
            slug: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    return this.actorModel
      .find(options)
      .select('-updatedAt -__v')
      .sort({
        createdAt: 'desc',
      })
      .exec();
  }

  // Admin
  async byId(_id: string) {
    const actor = await this.actorModel.findById(_id);
    if (!actor) throw new NotFoundException('actor not found');

    return actor;
  }

  async create() {
    const defaultValue: ActorDto = {
      name: '',
      slug: '',
      photo: '',
    };
    const actor = await this.actorModel.create(defaultValue);
    return actor._id;
  }

  async update(_id: string, dto: ActorDto) {
    const updateDoc = await this.actorModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec();
    if (!updateDoc) throw new NotFoundException('actor not found');

    return updateDoc;
  }

  async delete(id: string) {
    const deleteDoc = this.actorModel.findByIdAndDelete(id).exec();
    if (!deleteDoc) throw new NotFoundException('actor not found');

    return deleteDoc;
  }
}
