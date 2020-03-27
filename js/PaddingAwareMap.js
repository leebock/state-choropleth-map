L.PaddingAwareMap = L.Map.extend({

  initialize: function(div, options, paddingQueryFunction)
  {
    L.Map.prototype.initialize.call(this, div, options);      
    this._paddingQueryFunction = paddingQueryFunction;
  },

    /*************************************************/
    /******************* METHODS *********************/
    /*************************************************/

    fitBounds: function(bnds)
    {
        L.Map.prototype.fitBounds.call(
            this, 
            bnds, 
            this._paddingQueryFunction()
        );
    },

    flyToBounds: function(bnds)
    {
        var options = this._paddingQueryFunction();
        options.animate = true;
        L.Map.prototype.flyToBounds.call(
            this, 
            bnds,
            options
        );
    },
    
    getUsableBounds: function()
    {
        
        var pBR = this._paddingQueryFunction().paddingBottomRight;
        var pTL = this._paddingQueryFunction().paddingTopLeft;
    
        var ll = L.point({
            x: pTL[0],
            y: this.getSize().y - pBR[1]	
        });							
    
        var ur = L.point({
            x: this.getSize().x - pBR[0],
            y: pTL[1]	
        });
    
        var bounds = L.latLngBounds(
            this.containerPointToLatLng(ll),
            this.containerPointToLatLng(ur)
        );
        
        return bounds;
        
    },

    panTo: function(latLng)
    {
        // override panTo to accomodate padding
        var paddingOptions = this._paddingQueryFunction();
        latLng = this.containerPointToLatLng(
            this.latLngToContainerPoint(latLng)
                .add([
                    paddingOptions.paddingBottomRight[0]/2, 
                    paddingOptions.paddingBottomRight[1]/2
                ])
                .subtract([
                    paddingOptions.paddingTopLeft[0]/2, 
                    paddingOptions.paddingTopLeft[1]/2
                ])
        );

        L.Map.prototype.panTo.call(this, latLng, {animate: true, duration: 1});

    },
  
    zoomIn: function(zoomDelta, options)
    {
        this.setView(
            this._calcNewCenter(
                this.getCenter(), 
                this.getZoom()+zoomDelta, 
                this._paddingQueryFunction()
            ),
            this.getZoom()+zoomDelta,
            options
        );
    }, 

    zoomOut: function(zoomDelta, options)
    {
        this.setView(
            this._calcNewCenter(
                this.getCenter(), 
                this.getZoom()-zoomDelta, 
                this._paddingQueryFunction()
            ),
            this.getZoom()-zoomDelta,
            options
        );
    },

    /*************************************************/
    /************* "PRIVATE" FUNCTIONS ***************/
    /*************************************************/
  
    _calcNewCenter: function(center, targetZoom, paddingOptions)
    {
        var targetPoint = this.project(center, targetZoom);
        if (targetZoom < this.getZoom()) {
            targetPoint = targetPoint.subtract([
                (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/4,
                (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/4
            ]);
        } else {                
            targetPoint = targetPoint.add([
                (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/2,
                (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/2
            ]);
        }
        return this.unproject(targetPoint, targetZoom);
    },


});
