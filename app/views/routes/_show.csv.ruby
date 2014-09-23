if route.vehicle
  csv << [
    (route.vehicle.name if route.vehicle),
    0,
    (route.start.strftime("%H:%M") if route.start),
    0,
    nil,
    route.vehicle.store_start.name,
    route.vehicle.store_start.street,
    nil,
    route.vehicle.store_start.postalcode,
    route.vehicle.store_start.city,
    route.vehicle.store_start.lat,
    route.vehicle.store_start.lng,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil
  ]
end

index = 0
route.stops.each { |stop|
  csv << [
    (route.vehicle.name if route.vehicle),
    (index+=1 if route.vehicle),
    (stop.time.strftime("%H:%M") if route.vehicle && stop.time),
    (stop.distance if route.vehicle),
    stop.destination.ref,
    stop.destination.name,
    stop.destination.street,
    stop.destination.detail,
    stop.destination.postalcode,
    stop.destination.city,
    stop.destination.lat,
    stop.destination.lng,
    stop.destination.comment,
    (stop.destination.take_over.strftime("%H:%M:%S") if stop.destination.take_over),
    stop.destination.quantity,
    ((stop.active ? '1' : '0') if route.vehicle),
    (stop.destination.open.strftime("%H:%M") if stop.destination.open),
    (stop.destination.close.strftime("%H:%M") if stop.destination.close),
    stop.destination.tags.collect(&:label).join(','),
    stop.out_of_window ? 'x' : '',
    stop.out_of_capacity ? 'x' : '',
    stop.out_of_drive_time ? 'x' : ''
  ]
}

if route.vehicle
  csv << [
    (route.vehicle.name if route.vehicle),
    index+1,
    (route.end.strftime("%H:%M") if route.end),
    route.stop_distance,
    nil,
    route.vehicle.store_stop.name,
    route.vehicle.store_stop.street,
    nil,
    route.vehicle.store_stop.postalcode,
    route.vehicle.store_stop.city,
    route.vehicle.store_stop.lat,
    route.vehicle.store_stop.lng,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    nil,
    route.stop_out_of_drive_time ? 'x' : ''
  ]
end
