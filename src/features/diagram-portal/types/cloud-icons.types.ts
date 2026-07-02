export interface CloudIcon {
  cloud: string
  category: string
  subcategory: string | null
  name: string
  fileName: string
  relativePath: string
}

export interface CloudIconGroup {
  cloud: string
  categories: {
    [category: string]: CloudIcon[]
  }
}

export interface CloudIconSection {
  title: string
  cloud: string
  categories: {
    [category: string]: CloudIcon[]
  }
}
