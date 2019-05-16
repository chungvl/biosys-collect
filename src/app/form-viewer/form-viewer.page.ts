import { Component, OnInit } from '@angular/core';
import { MobileService } from '../shared/services/mobile.service';
import { Router } from '@angular/router';
import { JsonPointer } from 'angular6-json-schema-form';
import { Location } from '@angular/common';

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.page.html',
  styleUrls: ['./form-viewer.page.scss'],
})
export class FormViewerPage implements OnInit {
  public formSchema: any;
  private liveFormData: any = {};
  private formValidationErrors: any;
  private formIsValid = null;
  private submittedFormData: any = null;

  private yourJsonSchema = {
    'name': 'Testy Test',
    'layout': {
      'schema': {
        'type': 'object',
        'title': 'This is a test',
        'properties': {
          'IndDetectionID': {
            'title': 'IndDetectionID',
            'type': 'number',
            'description': 'IndDetectionID Desc',
          },
          'SpeciesID': {
            'title': 'SpeciesID',
            'type': 'number',
            'description': 'SpeciesID desc'
          },
          'Species': {
            'type': 'string',
            'title': 'Species Test',
            'enum': [
              'A',
              'B',
              'C'
            ],
            'description': 'Species Desc'
          }
        },
        'required': [
          'IndDetectionID',
        ],
        'form': [
          {
            'key': 'IndDetectionID',
            'placeholder': 'IndDetectionID placeholder',
            'title': 'IndDet Title',
            'label': 'HelloInd',
          },
          {
            'title': 'Species ID Title',
            'label': 'Hello',
            'key': 'SpeciesID',
            'placeholder': 'Species ID Placeholder'
          },
          'Species'
        ]
      }
    }
  };

  private validationErrorToDisplay = '';

  constructor(private mobileService: MobileService, private router: Router, private pageLocation: Location) {
    // this.formSchema = this.yourJsonSchema;
    this.formSchema = mobileService.getViewForm() || this.yourJsonSchema;
    return;
  }

  ngOnInit() {
  }


  onSubmit(data: any) {
    console.log('submitted', data);
    this.pageLocation.back();
    if (this.formIsValid) {
      this.submittedFormData = data;

      // TODO: patch sensor data in

      const dataPoint: any = {
        dataSetID: this.formSchema.dataset,
        formData: data,
      };

    } else {
      alert(this.validationErrorToDisplay);
    }
    return;
  }

  onChanges(data: any) {
    this.liveFormData = data;
  }

  isValid(isValid: boolean): void {
    this.formIsValid = isValid;
    console.log('isvalid', isValid);
  }

  getFieldTitle(titlePath: string): string {
    const path = titlePath.split('/');
    let thing = this.formSchema.layout.schema.properties;
    thing = thing[path[path.length - 1 ]];
    return thing.title || '';
  }

  validationErrors(data: any): void {
    try {
      console.log('valerr', data);
      this.formValidationErrors = data;
      if (data.length > 0) {
        const err = data[0];
        if (err.keyword === 'required') {
          this.validationErrorToDisplay = `${err.message || ''}`;
        } else {
          const path = err.dataPath.split('/');
          let thing = this.formSchema.layout.schema.properties;
          thing = thing[path[path.length - 1]];
          this.validationErrorToDisplay = `${thing.title || ''}: ${err.message}`;
        }
      }
    } catch (exception) {
      this.validationErrorToDisplay = '';
    }
    return;
  }
}
