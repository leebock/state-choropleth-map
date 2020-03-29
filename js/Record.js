function Record(json)
{
	console.log(json);
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