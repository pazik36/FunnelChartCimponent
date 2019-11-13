({
	fetchData : function(component) {
		var action = component.get("c.getAccountDynamicData");

		var jsonData = JSON.stringify({fields:component.get("v.fields"),
										groupBy:component.get("v.groupBy"),
										filters:component.get("v.filters"),
                                        sortBy: component.get("v.sortBy"),
										sortDirection: component.get("v.sortDirection"),
										sortByStatic: component.get("v.sortByStatic")
		});

		action.setParams({
        	jsonData : jsonData
        });
		
		action.setCallback(this,function(response){
			var state = response.getState();
			console.log('state = ' + state);
			if (state === "SUCCESS") {
				var result = response.getReturnValue();
				
				var accountData = [];
				var totalAnnualRevenue = 0;
				var totalRecords = 0;

				var labelset=[];
				var dataset=[];
				var dataObj =[];

                for(var key in result){
					var subTotalAnnualRevenue = 0;
					result[key].forEach(record => {
						if(record.AnnualRevenue){
							subTotalAnnualRevenue += record.AnnualRevenue;
						}
					}); 
					totalAnnualRevenue += subTotalAnnualRevenue;
					totalRecords += result[key].length;
					accountData.push({value:result[key], key:key, subtotal: subTotalAnnualRevenue});

					labelset.push((key == 'null' ? '' : key));
					dataset.push(result[key].length);
					dataObj.push({name:(key == 'null' ? '' : key), y:result[key].length});
                }
				component.set("v.accountData", accountData);
				component.set("v.totalRecords",totalRecords);
				component.set("v.totalAnnualRevenue",totalAnnualRevenue);

				Highcharts.chart('container', {
					chart: {
						type: 'funnel'
					},
					title: {
						text: 'Follow up status of Accounts'
					},
					plotOptions: {
						series: {
							dataLabels: {
								enabled: true,
								format: '<b>{point.name}</b> ({point.y:,.0f})',
								softConnector: true
							},
							center: ['50%', '50%'],
							neckWidth: '30%',
							neckHeight: '0%',
							width: '60%'
						}
					},
					legend: {
						enabled: false
					},
					series: [{
						name: 'Number of Leads',
                        data:dataObj
                    }],
				
					responsive: {
						rules: [{
							condition: {
								maxWidth: 500
							},
							chartOptions: {
								plotOptions: {
									series: {
										dataLabels: {
											inside: false
										},
										center: ['50%', '50%'],
										width: '100%'
									}
								}
							}
						}]
					}
				});
			} 
			else if (state === "ERROR") {
				var errors = response.getError();
				if (errors) {
					
					console.log("Error message: " + JSON.stringify(errors));
					
				} else {
					console.log("Unknown error");
				}
			}
			component.set('v.showSpinner', false);
		});
		$A.enqueueAction(action);
	},
	sortData: function (component, fieldName, sortDirection) {
		var accountData = component.get("v.accountData");
        var reverse = sortDirection !== 'ASC';
		var accountDataSorted = [];
		accountData.forEach(item => {
			var data = item.value;
			data.sort(this.sortBy(fieldName, reverse));
			accountDataSorted.push({value:data, key:item.key, subtotal:item.subtotal});
		}); 
		
		component.set("v.accountData", accountDataSorted);
	},
	sortBy: function (field, reverse, primer) {
		var key = primer ? function(x) {return primer(x[field])} : function(x) {return x[field]};
		//checks if the two rows should switch places
		reverse = !reverse ? 1 : -1;
		return function (a, b) {
			a = key(a);
			b = key(b);

			if($A.util.isEmpty(a)){
				return  1;
			}
			if($A.util.isEmpty(b)){
				return  -1;
			}
			return reverse * ((a > b) - (b > a)) ;
		}
	},
	editRecord : function (component, recordId) {
		let modalBody,modalHeader,modalFooter;
		let cmps = [
			['c:GenericConfirmationModalHeader',{
                title: 'Quick Edit'
            }],
			['c:AccountQuickEdit',{
				accountId: recordId
			}],
            ['c:GenericConfirmationModalFooter',{
				okLabel: 'Submit',
				onConfirm: component.getReference("c.submitAccountQuickEdit")
            }]
		];

		$A.createComponents(cmps, (components, status) => {
			if(status === 'SUCCESS'){
				modalHeader = components[0];
				modalBody = components[1];
				modalFooter = components[2];
				component.set("v.modalBody",modalBody);
				component.find('overlayLib').showCustomModal({
					header: modalHeader, 
                    body: modalBody, 
                    footer: modalFooter,
					showCloseButton: true,
					closeCallback: function() {
						if(component.get("v.refreshReports")){
							let evt = component.getEvent("refreshReport");
							evt.fire();
							component.set("v.refreshReports",false);
						}
					}
				});
			}
		});
	}
})
