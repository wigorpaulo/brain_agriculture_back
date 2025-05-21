import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { cpf, cnpj } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'IsCpfOrCnpj', async: false })
export class IsCpfOrCnpj implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    const onlyNumbers = value.replace(/\D/g, '');

    return cpf.isValid(onlyNumbers) || cnpj.isValid(onlyNumbers);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'CPF ou CNPJ inválido.';
  }
}
