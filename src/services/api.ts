import axios from 'axios';

// Interfaz para tipar la respuesta esperada del HTML
interface BarcodeLookupResponse {
    productName?: string;
    error?: string;
}

export const fetchProductName = async (barcode: string): Promise<string> => {
    try {
        // Construimos la URL con el código de barras
        const url = `https://www.barcodelookup.com/${barcode}`;
        
        // Añadimos cabeceras para simular un navegador real y evitar el bloqueo 403
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                'Connection': 'keep-alive',
            }
        });
        
        // response.data contiene el HTML completo como string
        const htmlContent = response.data;
        
        // Aquí necesitarías parsear el HTML para extraer el nombre del producto
        // Puedes usar regex simple o una librería como 'cheerio'
        const productName = extractProductNameFromHtml(htmlContent);
        
        return productName || "Unknown Product";
    } catch (error) {
        console.error("API Error fetching product:", error);
        return "Unknown Product";
    }
};

// Función auxiliar para extraer el nombre del producto del HTML
function extractProductNameFromHtml(html: string): string | null {
    // Ejemplo simple usando expresión regular
    // NOTA: Esto es frágil y depende de la estructura actual del HTML
    const match = html.match(/<h4[^>]*>([^<]+)<\/h4>/i);
    if (match && match[1]) {
        let productName = match[1].trim();

        if (productName == "Log in to Your API Account") {
        return "Unknown Product";
      }
    }
    

    
    // Si quieres una solución más robusta, instala cheerio:
    // npm install cheerio @types/cheerio
    // Y descomenta el siguiente código:
    /*
    const $ = cheerio.load(html);
    const name = $('.product-title').first().text().trim();
    if (name) return name;
    */
    
    return null;
}