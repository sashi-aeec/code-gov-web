import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { AgencyService, Agency } from '../../../../../services/agency';
import { StatusService } from '../../../../../services/status';

import { Subscription } from 'rxjs/Subscription';
import { SeoService } from '../../../../../services/seo';


@Component({
  selector: 'compliance-dashboard',
  template: require('./compliance-dashboard.template.html')
})

export class ComplianceDashboardComponent implements OnInit, OnDestroy {
  agencyIds=[];
  public statuses=[];
  public updated;
  private statusesSub: Subscription;

  constructor(
    private agencyService: AgencyService,
    private statusService: StatusService
    ) {}

  ngOnInit() {
    this.getAgencyIds();
    this.getStatuses();
  }

  ngOnDestroy(){
  	if (this.statusesSub) this.statusesSub.unsubscribe();
  }


  getAgencyIds(){
    this.agencyIds = [];
    var agencies = this.agencyService.getAgencies();
    for(let agency of agencies){
      this.agencyIds.push(agency.id);
    }
  }

  getStatuses() {
    var agency;
    var requirements
    var rValue;
    var requirementStatus;
    var overallStatus;
    var codePath;

    this.statusesSub = this.statusService.getJsonFile().
      subscribe((result) => {
        if (result) {

          for (let status in result.statuses) {
 			      
             //if agencyWidePolicy is null in report.json it means the agency doesn't have to comply, 
             //so don't include it in the dash.
             //TODO: should make this more explicit in the API, 
            if(result.statuses[status].requirements["agencyWidePolicy"] != null){
              
              // TODO: pull from AgencyService, which currently only provides agencies that have code included on the site.

              requirements = new Array();
              for(let requirement in result.statuses[status].requirements){
               
                rValue = result.statuses[status].requirements[requirement];
                if(rValue <1){
                  if(rValue > 0){
                    requirementStatus = "partial";
                  }
                  else {
                    requirementStatus = "noncompliant";
                  }
                }
                else{
                  requirementStatus = "compliant";
                }

                if(requirement != "overallCompliance"){
                  requirements.push({"text": requirement, "status": requirementStatus});
                }
                else{
                 overallStatus = requirementStatus;
                }

              }

              if(this.agencyIds.find(function(x){return x==status;})){
                codePath = "/explore-code/agencies/" + status;
              }
              else{
                codePath = null;
              }

              agency = { "id" : status, "name" : result.statuses[status].metadata.agency.name, "overall" : overallStatus, "codePath": codePath }; 
            	this.statuses.push({"id": status, "agency": agency, "requirements": requirements});
              this.updated = result.timestamp;

            }
          }
        } else {
          console.log('Error.');
        }
    });

  }

}
