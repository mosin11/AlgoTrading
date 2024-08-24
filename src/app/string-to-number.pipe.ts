import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToNumber',
  standalone: true
})
export class StringToNumberPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
