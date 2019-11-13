({
	doInit : function(component, event, helper) {
		console.log("CPR_DMR init");
		component.set('v.showSpinner', true);
		helper.fetchData(component,helper);
	},
	updateColumnSorting: function(component, event, helper) {
		var fieldName = event.target.dataset.div;
		var sortDirection;

		var sortIcon = fieldName.includes("__c") ? component.find(fieldName.replace("__c","__SortIcon")) : component.find(fieldName + "__SortIcon");
		var sortIconDirection = sortIcon.get("v.iconName");
		if($A.util.hasClass(sortIcon, "slds-hidden")){
			$A.util.removeClass(sortIcon, "slds-hidden");
			var prevSortField = component.get("v.prevSortField");
			if(!$A.util.isEmpty(prevSortField)){
				var prevAscIcon = prevSortField.includes("__c") ? component.find(prevSortField.replace("__c","__SortIcon")) : component.find(prevSortField + "__SortIcon");
				prevAscIcon.set("v.iconName","utility:arrowup");
				$A.util.addClass(prevAscIcon, "slds-hidden");
			}
			component.set("v.prevSortField",fieldName)
			sortDirection = 'ASC';
		}
		else if(sortIconDirection == "utility:arrowup"){
			sortIcon.set("v.iconName","utility:arrowdown");
			sortDirection = 'DESC';
		}
		else if(sortIconDirection == "utility:arrowdown"){
			sortIcon.set("v.iconName","utility:arrowup");
			sortDirection = 'ASC';
		}
		component.set("v.sortBy",fieldName);
		component.set("v.sortDirection",sortDirection);

		if(component.get("v.totalRecords") > 50){
			component.set('v.showSpinner', true);
			helper.fetchData(component);
		}else{
			helper.sortData(component, fieldName, sortDirection);
		}
		
	},
	handleRowAction: function (component, event, helper) {
		var recordId = event.getSource().get("v.name");
		helper.editRecord(component,recordId);
	},
	submitAccountQuickEdit: function (component, event, helper){
		let modal = component.get("v.modalBody");
		component.set("v.refreshReports",true);
		modal.submit();
	}
})
