// Copyright © Mapotempo, 2015-2017
//
// This file is part of Mapotempo.
//
// Mapotempo is free software. You can redistribute it and/or
// modify since you respect the terms of the GNU Affero General
// Public License as published by the Free Software Foundation,
// either version 3 of the License, or (at your option) any later version.
//
// Mapotempo is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
// or FITNESS FOR A PARTICULAR PURPOSE.  See the Licenses for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Mapotempo. If not, see:
// <http://www.gnu.org/licenses/agpl.html>
//
'use strict';

$(document).on('ready page:load', function() {
  $('[data-toggle="selection"]').toggleSelect();
  $('input[data-change="filter"]').filterTable();
  $('[type="checkbox"][data-toggle="disable-multiple-actions"]').toggleMultipleActions();

  dropdownAutoDirection($('[data-toggle="dropdown"]'));

  $('.modal').on('shown.bs.modal', function() {
    // Focus first primary button
    $('.btn-primary', this).first().focus();
    $('.modal-body .overflow-500', this).height(($(window).height()/3)*2);
  });
});

/* global jQuery */
(function($) {
  $.fn.toggleSelect = function() {
    this.click(function() {
      var $this = null;
      $($(this).data('target') + ' input:checkbox').each(function() {
        $this = $(this);
        if ($this.is(':visible')) {
          this.checked = !this.checked;
        }
      });
      $this.change(); // send only one event for perf
    });
    return this;
  };

  $.fn.filterTable = function() {
    var filterTimeoutId = null;
    this.each(function() {
      var $filter = $(this);
      $filter.keyup(function() {
        if (filterTimeoutId) clearTimeout(filterTimeoutId);
        filterTimeoutId = setTimeout(function() {
          filterTimeoutId = null;
          onFilterChanged($filter.val(), $filter.data('target'));
        }, 200);
      });
      var filterText = $filter.val();
      if (filterText) onFilterChanged(filterText, $filter.data('target'));
    });
    return this;
  };

  var onFilterChanged = function(text, selector) {
    $('body').addClass('ajax_waiting');
    var count = 0;
    $(selector + ' tbody tr').each(function(i, row) {
      var $row = $(row);
      var match = !text || $row.text().search(new RegExp(text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i')) > -1;
      $row.css('display', match ? 'table-row' : 'none');
      if (match) count++;
    });
    $(selector + '_count').text(count);
    $(selector + ' [data-change="filter"]').trigger('table.filtered');
    $('body').removeClass('ajax_waiting');
  };

  $.fn.toggleMultipleActions = function() {
    if ($(this)) {
      $(this).change(function() {
        onObjectSelected($(this).data('target'));
      });
      $(this).map(function() {
        return $(this).data('target');
      }).toArray().filter(function(elt, i, self) {
        return self.indexOf(elt) === i;
      }).forEach(function(id) {
        $(id).tooltip({placement: 'top', title: I18n.t('all.multiple-actions.none_selected_element')});
        onObjectSelected(id);
      });
    }
  };

  var onObjectSelected = function(selector) {
    if ($('[type="checkbox"][data-toggle="disable-multiple-actions"][data-target="' + selector + '"]:checked').length) {
      $(selector + ' button, ' + selector + ' select').attr('disabled', false).attr('title', '');
      $(selector).tooltip('disable');
    }
    else {
      $(selector + ' button, ' + selector + ' select').attr('disabled', true);
      $(selector).tooltip('enable');
    }
  };

  /**
   * @param {[capacity:, ​​​id:, ​​​label:, ​​​unitIcon:]} vehicleCapacities
   * @param {[take_over:, quantities:[deliverable_unit_id:,​​​​​quantity:,​​​​​unit_icon:]]} stops
   * @param {[{ capacity:, id:, label:, quantity:, unit_icon:}]} controllerParamsQuantities
   * @param {boolean} withCapacity
   * @param {boolean} withDuration
   */
  $.fn.fillQuantities = function(params) {
    var $this = this;
    $this.css({'margin': '.8em 0', 'text-align': 'left', 'width': '100%'});
    if (params.withDuration) $this.showOrCreateDuration();
    if (params.vehicleCapacities) {
      for (var index = 0; index < $("div[id^='quantity-']").length; index++) {
        $($("div[id^='quantity-']")[index]).hide();
      }
      params.vehicleCapacities.forEach(function(obj) {
        $this.showOrCreateQuantity(obj, params.withCapacity);
      });
    }
    $this.calculateQuantities(params.stops, params.controllerParamsQuantities);
    $this.find('[data-toggle="tooltip"]').tooltip();
  };

  $.fn.showOrCreateDuration = function() {
    var $this = this;
    if ($this.find('[class="duration"]').length == 0) {
      var input = '<div class="duration" style="display: block !important">' +
        '<span class="route-info" title="' + I18n.t('plannings.edit.route_visits_duration_help') + '" data-toggle="tooltip">' +
        '<i class="fa fa-clock-o fa-fw"></i>' +
        '<span class="duration"></span>' +
        '</span>' +
        '</div>';
      $this.append(input);
    } else {
      $this.find('div[class="duration"]').show();
    }
    return $this;
  };

  /**
   * @param {id, capacity, unitIcon, label} obj A deliverable unit object
   * @param {boolean} withCapacity true/false
   */
  $.fn.showOrCreateQuantity = function(obj, withCapacity) {
    var $this = this;
    if ($this.find('div[class="quantity-' + obj.id + '"]').length == 0) {
      var input = '<div class="quantity-' + obj.id + '">' +
        '<span class="route-info" title="' + I18n.t('plannings.edit.route_quantity_help') + '" data-toggle="tooltip">' +
        '<i class="icon-' + obj.id + ' fa ' + obj.unitIcon + ' fa-fw"></i>' +
        '&nbsp;<span class="quantity-' + obj.id + '"></span>';
      if (withCapacity) {
        if (obj.capacity) {
          input += '<span class="default-capacity-' + obj.id + '">/' + obj.capacity + '</span>';
        } else {
          input += '<span class="default-capacity-' + obj.id + '"></span>';
        }
      }
      input += '&nbsp;<span class="capacity-label-' + obj.id + '">' + obj.label + '</span>' +
        '</span>' +
        '</div>';
      $this.append(input);
    } else {
      if (obj.capacity && withCapacity) $this.find('div[class="default-capacity-' + obj.id + ']').html('/' + obj.capacity);
      $this.find('div[class="quantity-' + obj.id + '"]').show();
    }
  };

  $.fn.calculateQuantities = function(stops, controllerParamsQuantities) {
    var $this = this;
    var durationElement = $this.find('span[class="duration"]');
    var index = 0;
    var result = {duration: 0, quantities: []};

    if (stops.length === 0) {
      var spanQuantity = $this.find('span[class^="quantity-"]');
      for (index = 0; index < spanQuantity.length; index++) {
        $(spanQuantity[index]).html(0);
      }
    } else {
      stops.forEach(function(stop) {
        durationElement.empty();
        stop.quantities.forEach(function(obj) {
          $this.find('span[class="quantity-' + obj.deliverable_unit_id + '"]').empty();
        });

        stop.quantities.forEach(function(quantity) {
          var oldValue = result.quantities[quantity.deliverable_unit_id] ? result.quantities[quantity.deliverable_unit_id].value : 0;
          var value = quantity.quantity + oldValue;
          var details = controllerParamsQuantities.filter(function(obj) { return obj.id == quantity.deliverable_unit_id; })[0];

          result.quantities[quantity.deliverable_unit_id] = {
            id: quantity.deliverable_unit_id,
            label: details ? details.label : quantity.label,
            unitIcon: details ? details.unit_icon : quantity.unit_icon,
            value: value
          };
        });
        result.duration = result.duration + stop.take_over;
      });

      result.quantities.forEach(function(quantity) {
        $this.showOrCreateQuantity(quantity);
        var color = 'inherit';
        var $defaultCapacityElement = $this.find('[class="default-capacity-' + quantity.id + '"]');
        if ($defaultCapacityElement.length !== 0) {
          var capacity = parseInt($defaultCapacityElement.html().replace('/', ''));
          if (quantity.value > capacity) color = 'red';
        }
        var $element = $this.find('span[class="quantity-' + quantity.id + '"]');
        $element.html(quantity.value % 1 === 0 ? quantity.value : quantity.value.toFixed(2)).css('color', color);
        $this.find('[class^="icon-' + quantity.id + '"]').css('color', color);
      });
    }

    durationElement.html(Number(result.duration).toHHMM());
    return $this;
  };
})(jQuery);

export const modal_options = function() {
  return {
    keyboard: false,
    show: true,
    backdrop: 'static'
  };
};

export const bootstrap_dialog = function(options) {
  var default_modal = $('#default-modal').clone();
  default_modal.find('.modal-title').html(options.title);
  default_modal.find('.modal-body').html(options.message);

  if (options.footer) {
    default_modal.find('.modal-footer').html(options.footer);
  }

  if (options.icon) {
    default_modal.find(options.replaceOnlyModalIcon ? '.modal-icon' : 'i.fa')
                 .addClass(options.icon).show();
  }

  if (options.dataDismiss === true) {
    default_modal.find('[data-dismiss]').show();
  }

  $("body").append(default_modal);
  return default_modal;
};

export const defaultMapZoom = 12;
export const mapInitialize = function(params) {
  var mapLayer, mapBaseLayers = {},
    mapOverlays = {},
    nbLayers = 0;
  for (var layer_name in params.map_layers) {
    var layer = params.map_layers[layer_name];
    var l = L.tileLayer(layer.url, {
      maxZoom: 18,
      attribution: layer.attribution
    });
    l.name = layer.name;
    if (layer.default) {
      mapLayer = l;
    }
    if (layer.overlay) {
      mapOverlays[layer_name] = l;
    } else {
      mapBaseLayers[layer_name] = l;
    }
    nbLayers++;
  }

  // Ensure touch compliance with chrome like browser
  L.controlTouchScreenCompliance();

  var map = L.map('map', {
    attributionControl: false,
    layers: mapLayer,
    zoomControl: false,
    closePopupOnClick: false
  }).setView([params.map_lat || 0, params.map_lng || 0], params.map_zoom || defaultMapZoom);
  map.defaultMapZoom = defaultMapZoom;

  L.control.zoom({
    position: 'topleft',
    zoomInText: '+',
    zoomOutText: '-',
    zoomInTitle: I18n.t('plannings.edit.map.zoom_in'),
    zoomOutTitle: I18n.t('plannings.edit.map.zoom_out')
  }).addTo(map);

  if (params.geocoder) {
    var geocoderLayer = L.featureGroup();
    map.addLayer(geocoderLayer);

    L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim({
        serviceUrl: "/api/0.1/geocoder/"
      }),
      position: 'topleft',
      placeholder: I18n.t('web.geocoder.search'),
      errorMessage: I18n.t('web.geocoder.empty_result'),
      defaultMarkGeocode: false
    }).on('markgeocode', function(e) {
      this._map.fitBounds(e.geocode.bbox, {
        maxZoom: 15,
        padding: [20, 20]
      });
      var focusGeocode = L.marker(e.geocode.center, {
        icon: new L.divIcon({
          html: '',
          iconSize: new L.Point(14, 14),
          className: 'focus-geocoder'
        })
      }).addTo(geocoderLayer);
      setTimeout(function() {
        geocoderLayer.removeLayer(focusGeocode);
      }, 2000);
    }).addTo(map);

    $('.leaflet-control-geocoder-icon').prop('title', I18n.t('web.geocoder.tooltip'));
  }

  if (params.overlay_layers) {
    $.extend(mapOverlays, params.overlay_layers);
  }

  if (nbLayers > 1) {
    L.control.layers(mapBaseLayers, mapOverlays, {
      position: 'topleft'
    }).addTo(map);
  } else {
    map.tileLayer = L.tileLayer(mapLayer.url, {
      maxZoom: 18,
      attribution: mapLayer.attribution
    });
  }

  map.iconSize = {
    large: {
      name: 'fa-2x',
      size: 32
    },
    medium: {
      name: 'fa-lg',
      size: 20
    },
    small: {
      name: '',
      size: 16
    }
  };

  return map;
};

// FIXME initOnly used for api-web because Firefox doesn't support hash replace (in Leaflet Hash) within an iframe. A new url is fetched by Turbolinks. Chrome works.
export const initializeMapHash = function(map, initOnly) {
  if (initOnly) {
    var urlParams = L.Hash.parseHash(window.location.hash);
    if (urlParams) {
      map.setView(urlParams.center, urlParams.zoom);
    }
  }
  // FIXME when turbolinks get updated to work with Edge
  else if (navigator.userAgent.indexOf('Edge') === -1) {
    map.addHash();
    var removeHash = function() {
      map.removeHash();
      $(document).off('page:before-change', removeHash);
    };
    $(document).on('page:before-change', removeHash);
  }

  return !window.location.hash;
};

export const customColorInitialize = function(selecter) {
  $('#customised_color_picker').click(function() {
    var colorPicker = $('#color_picker'),
      options_wrap = $(selecter + ' option[selected="selected"]');

    $('.color[data-selected=""]').removeAttr('data-selected');
    $('.color:last-child').attr('data-selected', '');
    options_wrap.removeAttr('selected');

    (navigator.userAgent.indexOf('Edge') != -1) ? colorPicker.focus(): colorPicker.click();
    colorPicker.on("input", function() {
      $('.color:last-child').attr('style', 'background-color: ' + this.value)
        .attr('data-color', this.value)
        .attr('title', this.value);
      $(selecter + ' option:last-child').attr('value', this.value)
        .prop('selected', true)
        .val(this.value);
    });
  });
};

export const templateSelectionColor = function(state) {
  if (state.id) {
    return $("<span class='color_small' style='background:" + state.id + "'></span>");
  } else {
    return $("<i />").addClass("fa fa-paint-brush").css("color", "#CCC");
  }
};

export const templateResultColor = function(state) {
  if (state.id) {
    return $("<span class='color_small' style='background:" + state.id + "'></span>");
  } else {
    return $("<span class='color_small' data-color=''></span>");
  }
};

function decimalAdjust(type, value, exp) {

  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));

  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

export const dropdownAutoDirection = function($updatedElement) {
  $updatedElement.parent().on('show.bs.dropdown', function() {
    $(this).find('.dropdown-menu').first().stop(true, true).slideDown({
      duration: 200
    });

    // Dropdown auto position
    var $parent = $(this).parent();

    if (!$($parent).hasClass('nav')) {
      var $window = $(window);
      var $dropdown = $(this).children('.dropdown-menu');

      var offset = $parent.offset();

      offset.bottom = offset.top + $parent.outerHeight(false);

      var container = {
        height: $parent.outerHeight(false)
      };

      container.top = offset.top;
      container.bottom = offset.top + container.height;

      var dropdown = {
        height: $dropdown.find('li').outerHeight(false) * $dropdown.find('li').length
      };

      var viewport = {
        top: $window.scrollTop(),
        bottom: $window.scrollTop() + $window.height()
      };

      var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
      var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

      var newDirection = 'below';

      if (!enoughRoomBelow && enoughRoomAbove) {
        newDirection = 'above';
      } else if (!enoughRoomAbove && enoughRoomBelow) {
        newDirection = 'below';
      }

      // var css = {
      //   left: offset.left,
      //   top: container.bottom
      // };
      //
      // if (newDirection == 'above') {
      //   css.top = container.top - dropdown.height;
      // }

      if (newDirection === 'above') {
        if ($parent.hasClass('dropdown')) $parent.removeClass('dropdown');
        if (!$parent.hasClass('dropup')) $parent.addClass('dropup');
      } else {
        if ($parent.hasClass('dropup')) $parent.removeClass('dropup');
        if (!$parent.hasClass('dropdown')) $parent.addClass('dropdown');
      }
    }
  });

  $updatedElement.parent().on('hide.bs.dropdown', function() {
    $(this).find('.dropdown-menu').first().stop(true, true).slideUp({
      duration: 200
    });
  });
};

export const routerOptionsSelect = function(selectId, params) {
  var checkInputFieldState = function($field, stateValue) {
    if (stateValue === true) {
      $field.fadeIn();
      $field.find('input').removeAttr('disabled');
    } else {
      $field.fadeOut();
      $field.find('input').attr('disabled', 'disabled');
    }
  };

  var checkSelectFieldState = function($field, stateValue) {
    if (stateValue === 'true') {
      $field.fadeIn();
      $field.find('select').removeAttr('disabled');
    } else {
      $field.fadeOut();
      $field.find('select').attr('disabled', 'disabled');
    }
  };

  var fieldsRouter = function(event, initialValue) {
    var selectedValue = null;
    if (typeof initialValue === 'undefined') {
      selectedValue = $(this).val();
    } else {
      selectedValue = initialValue;
    }

    if (selectedValue) {
      var routerId = selectedValue.split('_')[0];
      var routerOptions = params.routers_options[routerId];

      if (routerId && routerOptions) {
        // Car
        checkInputFieldState($('#router_options_approach_input'), routerOptions.approach);
        checkInputFieldState($('#router_options_snap_input'), routerOptions.snap);
        checkInputFieldState($('#router_options_strict_restriction_input'), routerOptions.strict_restriction);

        // Car and Truck
        checkInputFieldState($('#router_options_traffic_input'), routerOptions.traffic);
        checkInputFieldState($('#router_options_track_input'), routerOptions.track);
        checkInputFieldState($('#router_options_motorway_input'), routerOptions.motorway);
        checkInputFieldState($('#router_options_toll_input'), routerOptions.toll);

        // Truck
        checkInputFieldState($('#router_options_trailers_input'), routerOptions.trailers);
        checkInputFieldState($('#router_options_weight_input'), routerOptions.weight);
        checkInputFieldState($('#router_options_weight_per_axle_input'), routerOptions.weight_per_axle);
        checkInputFieldState($('#router_options_height_input'), routerOptions.height);
        checkInputFieldState($('#router_options_width_input'), routerOptions.width);
        checkInputFieldState($('#router_options_length_input'), routerOptions.length);
        checkSelectFieldState($('#router_options_hazardous_goods_input'), routerOptions.hazardous_goods);

        // Public transport
        checkInputFieldState($('#router_options_max_walk_distance_input'), routerOptions.max_walk_distance);
      }
    }
  };

  fieldsRouter(null, $(selectId).val());
  $(selectId).on('change', fieldsRouter);
};

if (!Math.round10) {
  Math.round10 = function(value, exp) {
    return decimalAdjust('round', value, exp);
  };
}

if (!Math.floor10) {
  Math.floor10 = function(value, exp) {
    return decimalAdjust('floor', value, exp);
  };
}

if (!Math.ceil10) {
  Math.ceil10 = function(value, exp) {
    return decimalAdjust('ceil', value, exp);
  };
}

L.controlTouchScreenCompliance = function() {
  /*
   Debug Leaflet.js => Detect if browser is mobile compliant && delete leaflet-touch css class

   Chrome | Safari | Edge | IE respond to maxTouchPoints
   Chrome | Safari | Edge | IE respond to any-pointer:fine
   Firefox doesn't respond at all
   */
  if (L.Browser.WebKit || L.Browser.chrome || L.Browser.ie) {
    var removeTouchStyle;
    if (('maxTouchPoints' in navigator) || ('msMaxTouchPoints' in navigator)) {
      removeTouchStyle = (navigator.maxTouchPoints === 0) || (navigator.msMaxTouchPoints === 0);
    } else if (window.matchMedia && window.matchMedia('(any-pointer:coarse),(any-pointer:fine)').matches) {
      removeTouchStyle = !window.matchMedia('(any-pointer:coarse)').matches;
    }
    if (removeTouchStyle) L.Browser.touch = false;
  }
};

// Button to disable clusters
L.disableClustersControl = function(map, routesLayer) {
  var disableClustersControl = L.Control.extend({
    options: {
      position: 'topleft'
    },

    onAdd: function() {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-disable-clusters');
      container.style.backgroundColor = 'white';
      container.style.width = '26px';
      container.style.height = '26px';

      var button = L.DomUtil.create('a', '', container);
      button.title = I18n.t('plannings.edit.marker_clusters');

      var icon = L.DomUtil.create('i', 'cluster-icon fa fa-certificate fa-lg', button);
      icon.style.marginLeft = '2px';

      container.onclick = function() {
        routesLayer.switchMarkerClusters();

        $('.cluster-icon').toggleClass('fa-certificate fa-circle-o');
      };

      return container;
    }
  });

  map.addControl(new disableClustersControl(routesLayer));
};

Number.prototype.toHHMM = function() {
  var sec_num = parseInt(this, 10);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours+':'+minutes;
};

Date.prototype.toLocalISOString = function() {
  // ISO 8601
  var d = this
    , pad = function(n) { return n<10 ? '0'+n : n}
    , tz = d.getTimezoneOffset() // mins
    , tzs = (tz>0 ? "-" : "+") + pad(parseInt(Math.abs(tz/60)))

  if (tz%60 != 0)
    tzs += pad(Math.abs(tz%60))

  if (tz === 0) // Zulu time == UTC
    tzs = 'Z'

  return d.getFullYear()+'-'
    + pad(d.getMonth()+1)+'-'
    + pad(d.getDate())+'T'
    + pad(d.getHours())+':'
    + pad(d.getMinutes())+':'
    + pad(d.getSeconds()) + tzs
};

export const templateTag = function(item) {
  var color = $(item.element).attr('data-color');
  var icon = $(item.element).attr('data-icon');

  if (icon && color) {
    return $('<span><i style="color:#' + color + '" class="fa ' + icon + '"></i>&nbsp;</span>').append($("<span/>").text(item.text));
  } else if (icon) {
    return $('<span><i class="fa ' + icon + '"></i>&nbsp;</span>').append($("<span/>").text(item.text));
  } else if (color) {
    return $('<span><i style="color:#' + color + '" class="fa fa-flag"></i>&nbsp;</span>').append($("<span/>").text(item.text));
  } else {
    return item.text;
  }
};
