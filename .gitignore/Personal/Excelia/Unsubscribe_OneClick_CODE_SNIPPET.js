<script runat="server">
Platform.Load("Core","1.1.1");
try{
</script>

%%[

VAR @skey, @jid, @reason, @lue, @lue_prop, @lue_statusCode, @overallStatus, @requestId, @Response, @Status, @Error

SET @skey = _subscriberkey
SET @emailAddress = AttributeValue("emailaddr")
SET @jid = RequestParameter("jobid")
SET @listid = RequestParameter("listid")
SET @batchid = RequestParameter("batchid")
SET @reason = "AMPscript one click unsubscribe"

SET @lue = CreateObject("ExecuteRequest")
SetObjectProperty(@lue,"Name","LogUnsubEvent")

SET @lue_prop = CreateObject("APIProperty")                 
SetObjectProperty(@lue_prop, "Name", "SubscriberKey")
SetObjectProperty(@lue_prop, "Value", @skey)
AddObjectArrayItem(@lue, "Parameters", @lue_prop)

SET @lue_prop = CreateObject("APIProperty")
SetObjectProperty(@lue_prop, "Name", "JobID")
SetObjectProperty(@lue_prop, "Value", @jid)
AddObjectArrayItem(@lue, "Parameters", @lue_prop)

SET @lue_prop = CreateObject("APIProperty")
SetObjectProperty(@lue_prop, "Name", "ListID")
SetObjectProperty(@lue_prop, "Value", @listid)
AddObjectArrayItem(@lue, "Parameters", @lue_prop)

SET @lue_prop = CreateObject("APIProperty")
SetObjectProperty(@lue_prop, "Name", "BatchID")
SetObjectProperty(@lue_prop, "Value", @batchid)
AddObjectArrayItem(@lue, "Parameters", @lue_prop)

SET @lue_prop = CreateObject("APIProperty")
SetObjectProperty(@lue_prop, "Name", "Reason")
SetObjectProperty(@lue_prop, "Value", @reason)
AddObjectArrayItem(@lue, "Parameters", @lue_prop)

SET @lue_statusCode = InvokeExecute(@lue, @overallStatus, @requestId)

SET @Response = Row(@lue_statusCode, 1)
SET @Status = Field(@Response,"StatusMessage")
SET @Error = Field(@Response,"ErrorCode") 

SET @updateRecord1 = UpdateSingleSalesforceObject(
     "Contact", @skey,
     "HasOptedOutOfEmail", "true")

SET @updateRecord2 = UpdateSingleSalesforceObject(
     "Contact", @skey,
     "Optin_MarketingEmail__c", "false")


]%%

<script runat="server">
}catch(e){
 Write(Stringify(e));
}
</script>