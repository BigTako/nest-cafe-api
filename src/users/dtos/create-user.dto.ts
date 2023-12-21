import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatching implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue; // compare the current field value with the value of the related field
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `$property must match ${relatedPropertyName}`;
  }
}

export class CreateUserDto {
  @IsString()
  @Length(2, 256)
  readonly name: string;

  @Expose()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly role: string;

  @IsString()
  @Length(8, 256)
  password: string;

  @IsString()
  @Length(8, 256)
  @Validate(IsPasswordMatching, ['password'])
  passwordConfirm: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsBoolean()
  activated: boolean;

  @IsOptional()
  passwordResetToken: string;

  @IsOptional()
  passwordResetExpires: Date;

  @IsOptional()
  accountActivationToken: string;

  @IsOptional()
  accountActivationTokenExpires: Date;
}
