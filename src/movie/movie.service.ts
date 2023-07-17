import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieModel } from './movie.model';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>,
  ) {}

  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm)
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    return this.movieModel
      .find(options)
      .select('-updatedAt -__v')
      .sort({
        createdAt: 'desc',
      })
      .populate('actors genres')
      .exec();
  }

  async bySlug(slug: string) {
    const doc = await this.movieModel
      .findOne({ slug })
      .populate('actors genres')
      .exec();
    if (!doc) throw new NotFoundException('Movie not found');
    return doc;
  }

  async byActor(actorId: Types.ObjectId) {
    const doc = await this.movieModel.find({ actors: actorId }).exec();
    if (!doc) throw new NotFoundException('Movies not found');
    return doc;
  }

  async byGenres(genreIds: Types.ObjectId[]) {
    const doc = await this.movieModel
      .find({ genres: { $in: genreIds } })
      .exec();
    if (!doc) throw new NotFoundException('Movies not found');
    return doc;
  }
  async getMostPopular() {
    return this.movieModel
      .find({ countOpened: { $gt: 0 } })
      .sort({ countOpened: -1 })
      .populate('genres')
      .exec();
  }

  async updateCountOpened(slug: string) {
    const updateDoc = await this.movieModel
      .findOneAndUpdate({ slug }, { $inc: { countOpened: 1 } }, { new: true })
      .exec();
    if (!updateDoc) throw new NotFoundException('Movie not found');

    return updateDoc;
  }

  // Admin
  async byId(_id: string) {
    const doc = await this.movieModel.findById(_id);
    if (!doc) throw new NotFoundException('Movie not found');

    return doc;
  }

  async create() {
    const defaultValue: UpdateMovieDto = {
      bigPoster: '',
      actors: [],
      genres: [],
      //   description: '',
      poster: '',
      title: '',
      videoUrl: '',
      slug: '',
    };
    const movie = await this.movieModel.create(defaultValue);
    return movie._id;
  }

  async update(_id: string, dto: UpdateMovieDto) {
    const updateDoc = await this.movieModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec();
    if (!updateDoc) throw new NotFoundException('actor not found');

    return updateDoc;
  }

  async delete(id: string) {
    const deleteDoc = this.movieModel.findByIdAndDelete(id).exec();
    if (!deleteDoc) throw new NotFoundException('actor not found');

    return deleteDoc;
  }
}
