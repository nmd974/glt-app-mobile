import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeLocal'
})
export class TimeLocalPipe implements PipeTransform {

  transform(value: any): string {
    const dateTmp = new Date(value).toISOString().split("T")[1].split(":");
    const dataTransformed = `${dateTmp[0]}:${dateTmp[1]}`;
    return dataTransformed;
  }

}
