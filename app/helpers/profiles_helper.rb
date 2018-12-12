module ProfilesHelper
  def routers_by_profile
    h = {}
    Profile.all.each do |profile|
      h[profile.id] = profile.routers.map{ |r| [r.id, r.time?, r.distance?]}
    end
    h
  end

  def routers_modes_by_profile(routers_by_profile)
    routers_by_profile.each do |profile, routers|
      routers_by_profile[profile] = format_routers_modes(routers)
    end
  end

  def format_routers_modes(routers_modes)
    routers_modes.flat_map do |router|
      modes = []
      modes << "#{router[0]}_time" if router[1]
      modes << "#{router[0]}_distance" if router[2]
      modes
    end
  end
end
