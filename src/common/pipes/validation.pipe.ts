import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { plainToClass } from '@nestjs/class-transformer';
import { validate } from '@nestjs/class-validator';

// @nestjs/common's built-in ValidationPipe hardcodes `require('class-validator')`,
// which is incompatible with the `@nestjs/class-validator` fork used in this project's DTOs.
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const instance = plainToClass(metatype, value) as object;
    const errors = await validate(instance, { whitelist: true });

    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        Object.values(error.constraints ?? {}),
      );
      throw new BadRequestException(messages);
    }

    return instance;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const primitives: Type<unknown>[] = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !primitives.includes(metatype);
  }
}
