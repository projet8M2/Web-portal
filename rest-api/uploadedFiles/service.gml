graph [
  DateObtained "16/01/11"
  GeoLocation "USA, Europe"
  GeoExtent "Country+"
  Network "AboveNet"
  Provenance "Primary"
  Access 0
  Source "http://www.above.net/maps/images/ABVT_overall.gif"
  Version "1.0"
  Type "COM"
  DateType "Current"
  Backbone 1
  Commercial 0
  label "service_abvt"
  ToolsetVersion "0.3.34dev-20120328"
  Customer 1
  IX 0
  SourceGitVersion "e278b1b"
  DateModifier "="
  DateMonth "01"
  LastAccess "16/01/11"
  Layer "IP"
  Creator "Topology Zoo Toolset"
  Developed 1
  Transit 1
  NetworkDate "2011_01"
  DateYear "2011"
  LastProcessed "2011_09_01"
  Testbed 0
  node [
    id 0
    label "Washington CDC"
    Country "United States"
    Longitude -77.03637
    Internal 1
    Latitude 38.89511
	Cpu 5
	Ram 20
	Disk 200
  ]
  node [
    id 9
    label "Frankfurt"
    Country "Germany"
    Longitude 8.68333
    Internal 1
    Latitude 50.11667
	Cpu 5
	Ram 20
	Disk 200
  ]
  node [
    id 22
    label "Chicago"
    Country "United States"
    Longitude -87.65005
    Internal 1
    Latitude 41.85003
	Cpu 5
	Ram 20
	Disk 200
  ]
  edge [
    source 0
    target 9
    LinkLabel "Leased Wavelength/Managed Service"
	bandwith 20
  ]
  edge [
    source 9
    target 22
    LinkLabel "Leased Wavelength/Managed Service"
	bandwith 40
  ]
]
