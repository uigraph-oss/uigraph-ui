const lagLngProviders: {
  url: string
  corsMode?: 'cors' | 'no-cors'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInfo: (data: any) => {
    lat: number
    lon: number
    country: string
    city?: string
  }
}[] = [
  {
    url: 'https://api.myip.la/en?json',
    getInfo: (data) => ({
      lat: Number(data.location.latitude),
      lon: Number(data.location.longitude),
      country: data.location.country_name,
      city: data.location.city,
    }),
  },
  {
    url: 'https://api.ip.sb/geoip',
    getInfo: (data) => ({
      lat: data.latitude,
      lon: data.longitude,
      country: data.country,
      city: data.city,
    }),
  },

  {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    getInfo: (data) => ({
      lat: Number(data.latitude),
      lon: Number(data.longitude),
      country: data.country,
    }),
  },
]

export async function fetchUserCountryName() {
  for (const provider of lagLngProviders) {
    try {
      const response = await fetch(provider.url, { mode: provider.corsMode })
      const data = await response.json()
      return provider.getInfo(data).country
    } catch {}
  }
}
