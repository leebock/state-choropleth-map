function Record(json)
{
	//console.log(json["Major Disaster Declaration"]);
	this._json = json;
}

Record.prototype.getName = function()
{
	return this._json.State;
};

Record.prototype.getStateAbbrev = function()
{
	return this._json.State.split("(").pop().replace(")","");
};

Record.prototype.getEmergencyDeclarationStatus = function()
{
	return this._json["Emergency Declaration"].trim().toLowerCase() === "yes";
};

Record.prototype.getMajorDisasterDeclarationStatus = function()
{
	return this._json["Major Disaster Declaration"].trim();
};

Record.prototype.getNationalGuardActivationStatus = function()
{
	return this._json["National Guard Activation"].trim().toLowerCase() === "yes";
};

Record.prototype.getStateEmployeeTravelRestrictionsStatus = function()
{
	return this._json["State Employee Travel Restrictions"].trim().toLowerCase() === "yes";
};