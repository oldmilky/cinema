import {
  IsArray,
  IsNumber,
  IsObject,
  IsString
} from 'class-validator';

export class Parameters {
  @IsNumber()
  year: number;

  @IsNumber()
  duration: number;

  @IsNumber()
  country: string;
}

export class UpdateMovieDto {
  @IsString()
  poster: string;

  @IsString()
  bigPoster: string;

  @IsString()
  title: string;

  // @IsString()
  // description: string;

  @IsString()
  slug: string;

  @IsObject()
  paramaters?: Parameters;

  @IsString()
  videoUrl: string;

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsArray()
  @IsString({ each: true })
  actors: string[];

  // @IsBoolean()
  issSendTelegram?: boolean;
}
