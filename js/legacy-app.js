// PDF.js configuration
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // PDF viewer state
    const pdfViewer = {
        doc: null,
        currentPage: 1,
        totalPages: 0,
        currentZoom: 1.1,
        searchTerm: '',
        searchActive: false
    };
    
    // Global variables for PDF search
    let pdfTextCache = {}; // Cache for extracted PDF text
    let allPdfs = []; // Array to store all PDF information
    let currentSearchTerms = [];
    let textLayerDivs = [];

    
    // DOM elements
    const wisdomCloseBtn = document.getElementById('wisdomCloseBtn');
    const wisdomToggleBtn = document.getElementById('wisdomToggleBtn');
    const header = document.getElementById('header');
    const langDropdownBtn = document.getElementById('langDropdownBtn');
    const langOptions = document.querySelectorAll('.dropdown-item');
    const mainContent = document.getElementById('mainContent');
    const initialContent = document.getElementById('initialContent');
    const pageTitle = document.getElementById('pageTitle');
    const currentLang = document.getElementById('currentLang');
    const wisdomContainer = document.getElementById('wisdomContainer');
    const konjenistvoBtn = document.getElementById('konjenistvoBtn');
    const konjenistvoMenu = document.getElementById('konjenistvoMenu');
    const kmetijstvoBtn = document.getElementById('kmetijstvoBtn');
    const kmetijstvoMenu = document.getElementById('kmetijstvoMenu');
    const mesarskaBtn = document.getElementById('mesarskaBtn');
    const mesarskaMenu = document.getElementById('mesarskaMenu');
    const footerWisdomText = document.getElementById('footerWisdomText');
    const contentSections = document.querySelectorAll('.content-section');
    const aboutSection = document.getElementById('aboutSection');
    const contentDisplay = document.getElementById('contentDisplay');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const aboutBtn = document.getElementById('aboutBtn');
    const newsBtn = document.getElementById('newsBtn');
    const shopDropdown = document.getElementById('shopDropdown');
    const b2bBtn = document.getElementById('b2bBtn');
    const b2bSection = document.getElementById('b2bSection');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomLevel = document.getElementById('zoomLevel');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.getElementById('searchInput');
    const globalSearchBtn = document.getElementById('globalSearchBtn');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const backButtonContainer = document.getElementById('backButtonContainer');
    const backButton = document.getElementById('backButton');
    const customerInfoDiv = document.getElementById('b2bStep1');


    window.addEventListener('load', fixFirefoxBackground);

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', fixFirefoxBackground);

    document.addEventListener('DOMContentLoaded', function() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', navigateBack);
        }
        
        // Initialize navigation history with initial state
        navigationHistory.pushState({
            type: VIEW_TYPES.INITIAL,
            titleKey: 'news'
        });

        loadLanguagePreference();
        setupDropdowns();
        // Quote is available on demand from the footer.

        document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
        menu.classList.remove('show');

        });
        
        // Collect all PDFs on page load
        allPdfs = collectAllPdfs();
        console.log(`Found ${allPdfs.length} PDF catalogs`);

    });

    // Card PDF links functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('pdf-viewer-link')) {
            e.preventDefault();
            const pdfPath = e.target.dataset.pdf;
            const titleKey = e.target.dataset.titleKey;
            const pageNumber = parseInt(e.target.dataset.page) || 1;
            
            showPDF(pdfPath, titleKey, pageNumber);
        }
    });

    // Current view state
    let currentView = {
        type: 'initial',
        titleKey: 'news',
        pdfTitleKey: null
    };
    
    // Current search state
    let currentResults = [];
    let currentPage = 1;
    const resultsPerPage = 5;
    let currentCategory = 'all';

    // Translations for all languages
    const translations = {
        slo: {
            aktualno1_title: "Kad za Dezinfekcijo",
            aktualno1_text: "● 1000×580×55cm<br>● V kompletu z podlogo (peno)<br>● V kompletu brez dezinf. sredstev",
            aktualno2_title: "Napajalnik ChickA, s kapalniki vode",
            aktualno2_text: "● Preprečuje okužbe vode od zunaj<br>● Viseči, 12 litrski, s pokrovom<br>● Za vse vrste in starosti perutnine",
            aktualno3_title: "Pastir Ranger Solar AS1800SC ",
            aktualno3_text: "● Za govedo, konje in male živali (2,4J)<br>● Komplet; pastir + solarne celice<br>● Za maksimalno 14km ograje",
            thought_of_day: "Misel Dneva",
            search_placeholder: "Išči po katalogih...",
            first_page: "Prva Stran",
            b2bStep1: "1. Korak - Vpis Stranke",
            news: "Novosti, Aktualno",
            about_us: "O Nas",
            equestrian: "Konjeništvo",
            agriculture: "Kmetijstvo/Vrt",
            butchery: "Mesarija/Kuhinja",
            konjenistvo_all_equipment: "Vsa Konjeniška Oprema",
            konjenistvo_povodci: "Povodci, Karabini in Biči",
            konjenistvo_krmilniki: "Solnice, Napajalniki in Krmilniki",
            kmetijstvo_electric_shepherds: "Električni Pastirji",
            kmetijstvo_insulators: "Izolatorji",
            kmetijstvo_wires_tapes: "Žice, Trakovi, Mreže in Palice",
            kmetijstvo_other_pasture: "Ostala Pašna Oprema",
            kmetijstvo_fasteners_hardware: "Naveze in Železnina",
            kmetijstvo_feeders_controllers: "Napajalniki in Krmilniki",
            kmetijstvo_milking_machines: "Molzni Stroji",
            kmetijstvo_milking_rubber: "Sesne Gume za Molz. stroje",
            kmetijstvo_other_milking: "Ostala Molzna Oprema",
            kmetijstvo_garden_equipment: "Vrtna Oprema",
            kmetijstvo_electric_barn: "Električna Hlevska Oprema",
            kmetijstvo_other_agricultural: "Ostala Kmetijska Oprema",
            mesarska_swibo_knives: "Noži Swibo in Ostali",
            mesarska_meat_grinders: "Elektr. in Ročne Mesoreznice",
            mesarska_plates_knives: "Ploščice in Noži za mesoreznice",
            mesarska_spare_parts: "Rezervni deli ter Ostali pribor za mesoreznice",
            mesarska_vacuum_packaging: "Strojčki in Vrečke za Vakuumsko Pakiranje",
            mesarska_stuffers: "Ležeče in Pokončne Polnilke",
            mesarska_casings_netting: "Ovitki, Mrežice, in Vrvice ter Čreva",
            mesarska_bone_saws: "Elektr. in Ročne Žage za kosti ter Kavlji",
            mesarska_slicers: "Salamoreznice in Mesarice",
            mesarska_food_processing: "Pripomočki za Predelavo Živil",
            mesarska_scales_other: "Tehtnice ter Ostala Mesarska Oprema",
            shepherds: "Pastirji in čredniki",
            new_shepherds: "Novi pastirji",
            shepherds_desc: "Oglejte si naše najnovejše pastirje in črednike za vaše kmetijske potrebe.",
            anniversary: "Jubilej 70 let",
            years: "70 let tradicije",
            anniversary_desc: "Praznujemo 70 let uspešnega delovanja na kmetijskom področju.",
            mechanization: "Kmetijska mehanizacija",
            mechanization_desc: "Novosti na področju kmetijske mehanizacije in orodja za vaše kmetije.",
            read_more: "Preberi več",
            about_text_1: "Podjetje Horizont Clair d.o.o. se že več kot 30 let ukvarja z prodajo...",
            about_text_2: "Zgodovina podjetja sega v leto 1993, ko smo začeli z prodajo...",
            our_team: "Naša ekipa",
            director: "Direktor",
            sales_manager: "Prodajna vodja",
            technical_advisor: "Tehnični svetovalec",
            e_shop: "E-Trgovine",
            retail_shop: "Spletna Trgovina (maloprodaja)",
            b2b_shop: "Spletna Veleprodaja (B2B)",
            b2b: "Spletna Veleprodaja (B2B)",
            business_accounts: "Poslovni računi",
            business_accounts_desc: "Registrirajte svoje podjetje za dostop do veleprodajnih cen, posebnih ponudb in ugodnosti.",
            wholesale: "Veleprodajna naročila",
            wholesale_desc: "Naročite večje količine izdelkov po posebnih veleprodajnih cenah za vaše podjetje.",
            dedicated_support: "Namenski svetovalec",
            dedicated_support_desc: "Vsakemu poslovnemu partnerju dodelimo osebnega svetovalca za vso podporo in pomoč.",
            volume_discounts: "Obsežni popusti",
            volume_discounts_desc: "Večje naročilo pomeni večje popuste. Ustvarite si trajne partnerske odnose z nami."
        },
        eng: {
            aktualno1_title: "Disinfection Tub",
            aktualno1_text: "● 1000×580×55cm<br>● Packaged with the padding (foam)<br>● Packaged without disinfectant agents",
            aktualno2_title: "Watering Trough Chicka, with water nipples",
            aktualno2_text: "● Preprečuje okužbe vode od zunaj<br>● Viseči, 12 litrski, s pokrovom<br>● Za vse vrste in starosti perutnine",
            aktualno3_title: "Pastir Ranger Solar AS1800SC ",
            aktualno3_text: "● ",
            thought_of_day: "Thought of the Day",
            search_placeholder : "Search catalogues...",
            first_page: "First Page",
            b2bStep1: "1. Step - Customer Login",
            news: "News, Current",
            about_us: "About Us",
            equestrian: "Equestrian",
            agriculture: "Agriculture/Garden",
            butchery: "Butchery/Kitchen",
            konjenistvo_all_equipment: "All Equestrian Equipment",
            konjenistvo_povodci: "Leads, Carabiners and Whips",
            konjenistvo_krmilniki: "Salt Licks, Waterers and Feeders",
            kmetijstvo_electric_shepherds: "Electric Shepherds",
            kmetijstvo_insulators: "Insulators",
            kmetijstvo_wires_tapes: "Wires, Tapes, Nets and Poles",
            kmetijstvo_other_pasture: "Other Pasture Equipment",
            kmetijstvo_fasteners_hardware: "Fasteners and Hardware",
            kmetijstvo_feeders_controllers: "Watering Trough and Feeders",
            kmetijstvo_milking_machines: "Milking Machines",
            kmetijstvo_milking_rubber: "Milking Machine Rubber",
            kmetijstvo_other_milking: "Other Milking Equipment",
            kmetijstvo_garden_equipment: "Garden Equipment",
            kmetijstvo_electric_barn: "Electric Barn Equipment",
            kmetijstvo_other_agricultural: "Other Agricultural Equipment",
            mesarska_swibo_knives: "Swibo Knives and Others",
            mesarska_meat_grinders: "Electric and Manual Meat Grinders",
            mesarska_plates_knives: "Plates and Knives for Meat Grinders",
            mesarska_spare_parts: "Spare Parts and Other Accessories",
            mesarska_vacuum_packaging: "Vacuum Packaging Machines and Bags",
            mesarska_stuffers: "Horizontal and Vertical Stuffers",
            mesarska_casings_netting: "Casings, Netting, Strings and Intestines",
            mesarska_bone_saws: "Electric and Manual Bone Saws and Hooks",
            mesarska_slicers: "Slicers and Butcher Machines",
            mesarska_food_processing: "Food Processing Accessories",
            mesarska_scales_other: "Scales and Other Butchery Equipment",
            shepherds: "Shepherds and Herders",
            new_shepherds: "New Shepherds",
            shepherds_desc: "Check out our latest shepherds and herders for your agricultural needs.",
            anniversary: "70 Years Anniversary",
            years: "70 Years of Tradition",
            anniversary_desc: "We celebrate 70 years of successful operation in the agricultural field.",
            mechanization: "Agricultural Mechanization",
            mechanization_desc: "News in the field of agricultural mechanization and tools for your farms.",
            read_more: "Read More",
            about_text_1: "Horizont Clair d.o.o. has been engaged in the sale and servicing of agricultural machinery, equestrian equipment and butchery technology for over 70 years. Our experience and knowledge are the foundation for quality products and services we offer to our customers.",
            about_text_2: "The history of the company dates back to 1953, when we started importing and selling agricultural machinery. Over the years, we have expanded our range and today we are the leading distributor of many world-renowned brands in the fields of agriculture, equestrian and butchery industry.",
            our_team: "Our Team",
            director: "Director",
            sales_manager: "Sales Manager",
            technical_advisor: "Technical Advisor",
            e_shop: "E-Shops",
            retail_shop: "Online Store (Retail)",
            b2b_shop: "Online Wholesale (B2B)",
            b2b: "OnLine Wholesale (B2B)",
            business_accounts: "Business Accounts",
            business_accounts_desc: "Register your company for access to wholesale prices, special offers and benefits.",
            wholesale: "Wholesale Orders",
            wholesale_desc: "Order larger quantities of products at special wholesale prices for your business.",
            dedicated_support: "Dedicated Support",
            dedicated_support_desc: "We assign a personal advisor to each business partner for all support and assistance.",
            volume_discounts: "Volume Discounts",
            volume_discounts_desc: "Larger orders mean bigger discounts. Build lasting partnerships with us."
        },
        ger: {
            aktualno1_title: "Desinfektionswanne",
            aktualno1_text: "● 1000×580×55cm<br>● Mit Polsterung (schamstoff) verpackt<br>● Ohne Desinfektionsmittel verpackt",
            aktualno2_title: "Tränkebecken Chicka, mit Wassertropfern",
            aktualno2_text: "● Preprečuje okužbe vode od zunaj<br>● Viseči, 12 litrski, s pokrovom<br>● Za vse vrste in starosti perutnine",
            aktualno3_title: "Pastir Ranger Solar AS1800SC ",
            aktualno3_text: "● Za govedo, konje in male živali (2,4J)<br>  ",
            thought_of_day: "Gedanke des Tages",
            search_placeholder: "Kataloge durchsuchen...",
            first_page: "Erste Seite",
            b2bStep1: "1. Schritt - Kundenlogin",
            news: "Nachrichten, Aktuelles",
            about_us: "Über Uns",
            equestrian: "Pferdesport",
            agriculture: "Landwirtschaft/Garten",
            butchery: "Metzgerei/Küche",
            konjenistvo_all_equipment: "Alle Pferdesportausrüstung",
            konjenistvo_povodci: "Leinen, Karabiner und Peitschen",
            konjenistvo_krmilniki: "Salzlecksteine, Wasserspender und Futterautomaten",
            kmetijstvo_electric_shepherds: "Elektrische Weidezäune",
            kmetijstvo_insulators: "Isolatoren",
            kmetijstvo_wires_tapes: "Drähte, Bänder, Netze und Stangen",
            kmetijstvo_other_pasture: "Andere Weideausrüstung",
            kmetijstvo_fasteners_hardware: "Befestigungen und Eisenwaren",
            kmetijstvo_feeders_controllers: "Futterautomaten und Steuerungen",
            kmetijstvo_milking_machines: "Melkmaschinen",
            kmetijstvo_milking_rubber: "Melkmaschinen-Gummis",
            kmetijstvo_other_milking: "Andere Melkausrüstung",
            kmetijstvo_garden_equipment: "Gartenausrüstung",
            kmetijstvo_electric_barn: "Elektrische Stallausrüstung",
            kmetijstvo_other_agricultural: "Andere landwirtschaftliche Ausrüstung",
            mesarska_swibo_knives: "Swibo-Messer und andere",
            mesarska_meat_grinders: "Elektrische und manuelle Fleischwölfe",
            mesarska_plates_knives: "Platten und Messer für Fleischwölfe",
            mesarska_spare_parts: "Ersatzteile und anderes Zubehör",
            mesarska_vacuum_packaging: "Vakuumverpackungsmaschinen und Beutel",
            mesarska_stuffers: "Liegende und stehende Füllmaschinen",
            mesarska_casings_netting: "Därme, Netze, Schnüre und Wursthüllen",
            mesarska_bone_saws: "Elektrische und manuelle Knochensägen und Haken",
            mesarska_slicers: "Aufschnittmaschinen und Metzgerausrüstung",
            mesarska_food_processing: "Zubehör für Lebensmittelverarbeitung",
            mesarska_scales_other: "Waagen und andere Metzgereiausrüstung",
            shepherds: "Hirten und Herdenbetreuer",
            new_shepherds: "Neue Hirten",
            shepherds_desc: "Entdecken Sie unsere neuesten Hirten und Herdenbetreuer für Ihre landwirtschaftlichen Bedürfnisse.",
            anniversary: "70 Jahre Jubiläum",
            years: "70 Jahre Tradition",
            anniversary_desc: "Wir feiern 70 Jahre erfolgreicher Tätigkeit im landwirtschaftlichen Bereich.",
            mechanization: "Landwirtschaftliche Mechanisierung",
            mechanization_desc: "Neuigkeiten im Bereich der landwirtschaftlichen Mechanisierung und Werkzeuge für Ihre Betriebe.",
            read_more: "Weiterlesen",
            about_text_1: "Horizont Clair d.o.o. beschäftigt sich seit über 70 Jahren mit dem Verkauf und Service von landwirtschaftlichen Maschinen, Pferdesportausrüstung und Metzgereitechnik. Unsere Erfahrung und unser Wissen sind die Grundlage für qualitativ hochwertige Produkte und Dienstleistungen, die wir unseren Kunden anbieten.",
            about_text_2: "Die Geschichte des Unternehmens reicht bis ins Jahr 1953 zurück, als wir mit dem Import und Verkauf von landwirtschaftlichen Maschinen begannen. Im Laufe der Jahre haben wir unser Angebot erweitert und sind heute führender Vertriebspartner vieler weltweit anerkannter Marken in den Bereichen Landwirtschaft, Pferdesport und Fleischindustrie.",
            our_team: "Unser Team",
            director: "Direktor",
            sales_manager: "Verkaufsleiter",
            technical_advisor: "Technischer Berater",
            e_shop: "E-Shops",
            retail_shop: "Online-Shop (Einzelhandel)",
            b2b_shop: "Online-Großhandel (B2B)",
            b2b: "Online-Großhandel (B2B)",
            business_accounts: "Geschäftskonten",
            business_accounts_desc: "Registrieren Sie Ihr Unternehmen für den Zugang zu Großhandelspreisen, Sonderangeboten und Vorteilen.",
            wholesale: "Großhandelsbestellungen",
            wholesale_desc: "Bestellen Sie größere Mengen von Produkten zu speziellen Großhandelspreisen für Ihr Unternehmen.",
            dedicated_support: "Persönlicher Berater",
            dedicated_support_desc: "Jedem Geschäftspartner weisen wir einen persönlichen Berater für alle Unterstützung und Hilfe zu.",
            volume_discounts: "Mengenrabatte",
            volume_discounts_desc: "Größere Bestellungen bedeuten höhere Rabatte. Bauen Sie dauerhafte Partnerschaften mit uns auf."
        },
        cro: {
            aktualno1_title: "Dezinfekcijska Kada",
            aktualno1_text: "● 1000×580×55cm<br>● Pakirano s podlogom (pjena)<br>● Pakirano bez dezinfekcijskih sredstava",
            aktualno2_title: "Pojilo za vodu Chika, s kapaljkama za vodu",
            aktualno2_text: "● Sprječava kontaminaciju vode izvana<br>● Viseći, 12 litara, s poklopcem<br>● Za sve vrste i uzraste peradi",
            aktualno3_title: "Pastir Ranger Solar AS1800SC ",
            aktualno3_text: "● ",
            thought_of_day: "Misao Dana",
            search_placeholder: "Pretraži kataloge...",
            first_page: "Prva Stranica",
            b2bStep1: "1. Korak - Prijava Korisnika",
            news: "Novosti, Aktualno",
            about_us: "O Nama",
            equestrian: "Konjogojstvo",
            agriculture: "Poljoprivreda/Vrt",
            butchery: "Mesarija/Kuhinja",
            konjenistvo_all_equipment: "Sva Konjička Oprema",
            konjenistvo_povodci: "Povodci, Karabineri i Bičevi",
            konjenistvo_krmilniki: "Soljenke, Dozatori vode i Krmilice",
            kmetijstvo_electric_shepherds: "Električni Pastiri",
            kmetijstvo_insulators: "Izolatori",
            kmetijstvo_wires_tapes: "Žice, Trake, Mreže i Stapovi",
            kmetijstvo_other_pasture: "Ostala Pašna Oprema",
            kmetijstvo_fasteners_hardware: "Pričvršćivači i Željezarija",
            kmetijstvo_feeders_controllers: "Pojilice i Hranilice",
            kmetijstvo_milking_machines: "Strojevi za Mužnju",
            kmetijstvo_milking_rubber: "Gume za Strojeve za Mužnju",
            kmetijstvo_other_milking: "Ostala Oprema za Mužnju",
            kmetijstvo_garden_equipment: "Vrtna Oprema",
            kmetijstvo_electric_barn: "Električna Oprema za Štale",
            kmetijstvo_other_agricultural: "Ostala Poljoprivredna Oprema",
            mesarska_swibo_knives: "Swibo Noževi i Ostali",
            mesarska_meat_grinders: "Električni i Ručni Mlinovi za Meso",
            mesarska_plates_knives: "Ploče i Noževi za Mlinove",
            mesarska_spare_parts: "Rezervni Dijelovi i Ostali Pribor",
            mesarska_vacuum_packaging: "Strojevi i Vrećice za Vakuumsko Pakiranje",
            mesarska_stuffers: "Ležeći i Uspravni Punjači",
            mesarska_casings_netting: "Ovojnice, Mrežice, Konopci i Crijeva",
            mesarska_bone_saws: "Električne i Ručne Pile za Kosti i Kuke",
            mesarska_slicers: "Sjeckalice i Mesarske Strojove",
            mesarska_food_processing: "Pribor za Preradu Hrane",
            mesarska_scales_other: "Vage i Ostala Mesarska Oprema",
            shepherds: "Pastiri i čobani",
            new_shepherds: "Novi pastiri",
            shepherds_desc: "Pogledajte naše najnovije pastire i čobane za vaše poljoprivredne potrebe.",
            anniversary: "Jubilej 70 godina",
            years: "70 godina tradicije",
            anniversary_desc: "Slavimo 70 godina uspješnog djelovanja u poljoprivrednom području.",
            mechanization: "Poljoprivredna mehanizacija",
            mechanization_desc: "Novosti na području poljoprivredne mehanizacije i alata za vaše farme.",
            read_more: "Pročitaj više",
            about_text_1: "Poduzeće Horizont Clair d.o.o. više od 70 godina se bavi prodajom i servisiranjem poljoprivredne mehanizacije, konjičke opreme i mesarske tehnologije. Naše iskustvo i znanje temelj su za kvalitetne proizvode i usluge koje nudimo našim kupcima.",
            about_text_2: "Povijest tvrtke seže do 1953. godine, kada smo započeli s uvozom i prodajom poljoprivredne mehanizacije. Tijekom godina proširili smo ponudu i danas smo vodeći distributer mnogih svjetski priznatih marki u područjima poljoprivrede, konjogojstva i mesne industrije.",
            our_team: "Naš tim",
            director: "Direktor",
            sales_manager: "Voditelj prodaje",
            technical_advisor: "Tehnički savjetnik",
            e_shop: "E-Trgovine",
            retail_shop: "Web Trgovina (maloprodaja)",
            b2b_shop: "Web Veleprodaja (B2B)",
            b2b: "Web Veleprodaja (B2B)",
            business_accounts: "Poslovni računi",
            business_accounts_desc: "Registrirajte svoje poduzeće za pristup veleprodajnim cijenama, posebnim ponudbama i pogodnostima.",
            wholesale: "Veleprodajne narudžbe",
            wholesale_desc: "Naručite veće količine proizvoda po posebnim veleprodajnim cijenama za vaše poduzeće.",
            dedicated_support: "Namjenski savjetnik",
            dedicated_support_desc: "Svakom poslovnom partnerju dodjeljujemo osobnog savjetnika za svu podršku i pomoć.",
            volume_discounts: "Količinski popusti",
            volume_discounts_desc: "Veće narudžbe znače veće popusti. Izgradite trajna partnerska partnerstva s nama."
        }
    };


 // Add back button translation
    translations.slo.back = "Nazaj";
    translations.eng.back = "Back";
    translations.ger.back = "Zurück";
    translations.cro.back = "Natrag";


    // Add these to your translations object for About us section
    translations.slo.company_name = "Horizont-Clair d.o.o.";
    translations.slo.locations_contact = "Lokacije in kontaktne informacije";
    translations.slo.store_zbilje = "Trgovina in sedež Zbilje";
    translations.slo.store_maribor = "Trgovina Maribor";
    translations.slo.store_novi_sad = "Trgovina Novi Sad, Srbija";
    translations.slo.warehouse = "Skladišče";
    translations.slo.tel = "Tel:";
    translations.slo.gsm = "GSM:";
    translations.slo.email = "E-pošta:";
    translations.slo.our_team = "Naša ekipa";
    translations.slo.role_director = "Direktor podjetja";
    translations.slo.role_accounting = "Računovodstvo";
    translations.slo.role_bookkeeping = "Knjigovodstvo";
    translations.slo.role_commerce_logistics = "Komerciala, logistika";
    translations.slo.role_commerce_procurement = "Komerciala, nabava";
    translations.slo.role_commerce = "Komerciala";
    translations.slo.role_alenka = "Pokriva področje Pomurja, Prlekije in vzhodne Štajerske";
    translations.slo.role_damjan = "Pokriva področje zahodne Štajerske, Koroške, Celjske kotline in Posavja";
    translations.slo.role_dusan = "Pokriva področje zahodne in južne Slovenije";
    translations.slo.role_zala = "Pokriva področje zahodne in južne Slovenije";
    translations.slo.event_images = "Slike z raznih dogodkov";
    translations.slo.event_25th_anniversary = "Jubilejna prireditev Horizont-Clair 25 letnica, Škofja Loka, 2018";
    translations.slo.event_hannover_2016 = "Sejem Hannover (obisk) jesen 2016";
    translations.slo.event_komenda_fall_2016 = "Sejem Komenda jesen 2016";
    translations.slo.event_gudovac_fall_2016 = "Sejem Gudovac jesen 2016";
    translations.slo.event_agra_august_2016 = "Sejem Agra Avgust 2016";
    translations.slo.event_komenda_spring_2016 = "Sejem Komenda Pomlad 2016";
    translations.slo.event_gudovac_spring_2016 = "Sejem Gudovac Pomlad 2016";
    translations.slo.event_komenda_fall_2015 = "Sejem Komenda Jesen 2015";
    translations.slo.event_agra_2015 = "Sejem Agra 2015 Gornja Radgona";
    translations.slo.event_excursion_2015 = "Ekskurzija 2015 na podjetje Horizont v Nemčiji ob 70 letnici proizvodnje pašne opreme";
    translations.slo.event_agra_2013 = "Sejem Agra Gornja Radgona 2013";
    translations.slo.event_agra_2010 = "Sejem Agra Gornja Radgona 2010";
    translations.slo.event_korbach_2010 = "Strokovna ekskurzija Korbach (Horizont) | 28 - 30 jan. 2010";
    translations.slo.event_agra_2009 = "Sejem Agra Gornja Radgona | 28 avg. - 5 sep. 2009";
    translations.slo.event_novi_sad_2009 = "Kmetijski sejem Novi Sad | 10 - 16 maj 2009";
    translations.slo.event_hunting_fishing_2009 = "Sejem lov - ribolov Gornja Radgona | 17 - 19 apr. 2009";
    translations.slo.event_store_opening_novi_sad = "Otvoritev trgovine v Novem Sadu | 18 okt. 2008";
    translations.slo.event_kzs_2008 = "KŽS Gornja Radgona | 23 - 29 avg 2008";
    translations.slo.event_store_opening_dogose = "Otvoritev trgovine v Dogošah | 08 sep. 2007";
    translations.slo.event_hunting_fishing_2007 = "Sejem lov ribolov Gornja Radgona | 20 - 22 apr. 2007";
    translations.slo.event_megra_2007 = "Megra, Gornja Radgona | 27-31 mar. 2007";
    translations.slo.event_kzs_2006 = "KŽS Gornja Radgona | 26 avg. - 1 sep. 2006";


    translations.eng.company_name = "Horizont-Clair d.o.o.";
    translations.eng.locations_contact = "Locations and Contact Information";
    translations.eng.store_zbilje = "Store and Headquarters Zbilje";
    translations.eng.store_maribor = "Store Maribor";
    translations.eng.store_novi_sad = "Store Novi Sad, Serbia";
    translations.eng.warehouse = "Warehouse";
    translations.eng.tel = "Tel:";
    translations.eng.gsm = "Mobile:";
    translations.eng.email = "Email:";
    translations.eng.our_team = "Our Team";
    translations.eng.role_director = "Company Director";
    translations.eng.role_accounting = "Accounting";
    translations.eng.role_bookkeeping = "Bookkeeping";
    translations.eng.role_commerce_logistics = "Commerce, Logistics";
    translations.eng.role_commerce_procurement = "Commerce, Procurement";
    translations.eng.role_commerce = "Commerce";
    translations.eng.role_alenka = "Covers the region of Pomurje, Prlekija and Eastern Styria";
    translations.eng.role_damjan = "Covers the region of Western Styria, Carinthia, Celje Basin and Posavje";
    translations.eng.role_dusan = "Covers the region of Western and Southern Slovenia";
    translations.eng.role_zala = "Covers the region of Western and Southern Slovenia";
    translations.eng.event_images = "Pictures from various events";
    translations.eng.event_25th_anniversary = "Horizont-Clair 25th Anniversary Celebration, Škofja Loka, 2018";
    translations.eng.event_hannover_2016 = "Hannover Fair (visit) autumn 2016";
    translations.eng.event_komenda_fall_2016 = "Komenda Fair autumn 2016";
    translations.eng.event_gudovac_fall_2016 = "Gudovac Fair autumn 2016";
    translations.eng.event_agra_august_2016 = "Agra Fair August 2016";
    translations.eng.event_komenda_spring_2016 = "Komenda Fair spring 2016";
    translations.eng.event_gudovac_spring_2016 = "Gudovac Fair spring 2016";
    translations.eng.event_komenda_fall_2015 = "Komenda Fair autumn 2015";
    translations.eng.event_agra_2015 = "Agra Fair 2015 Gornja Radgona";
    translations.eng.event_excursion_2015 = "Excursion 2015 to Horizont company in Germany on the 70th anniversary of pasture equipment production";
    translations.eng.event_agra_2013 = "Agra Fair Gornja Radgona 2013";
    translations.eng.event_agra_2010 = "Agra Fair Gornja Radgona 2010";
    translations.eng.event_korbach_2010 = "Professional excursion Korbach (Horizont) | Jan 28-30, 2010";
    translations.eng.event_agra_2009 = "Agra Fair Gornja Radgona | Aug 28 - Sep 5, 2009";
    translations.eng.event_novi_sad_2009 = "Agricultural Fair Novi Sad | May 10-16, 2009";
    translations.eng.event_hunting_fishing_2009 = "Hunting - Fishing Fair Gornja Radgona | Apr 17-19, 2009";
    translations.eng.event_store_opening_novi_sad = "Store opening in Novi Sad | Oct 18, 2008";
    translations.eng.event_kzs_2008 = "KŽS Gornja Radgona | Aug 23-29, 2008";
    translations.eng.event_store_opening_dogose = "Store opening in Dogoše | Sep 8, 2007";
    translations.eng.event_hunting_fishing_2007 = "Hunting Fishing Fair Gornja Radgona | Apr 20-22, 2007";
    translations.eng.event_megra_2007 = "Megra, Gornja Radgona | Mar 27-31, 2007";
    translations.eng.event_kzs_2006 = "KŽS Gornja Radgona | Aug 26 - Sep 1, 2006";

    // German translations About us
    translations.ger.company_name = "Horizont-Clair d.o.o.";
    translations.ger.locations_contact = "Standorte und Kontaktinformationen";
    translations.ger.store_zbilje = "Geschäft und Hauptsitz Zbilje";
    translations.ger.store_maribor = "Geschäft Maribor";
    translations.ger.store_novi_sad = "Geschäft Novi Sad, Serbia";
    translations.ger.warehouse = "Lager";
    translations.ger.tel = "Tel:";
    translations.ger.gsm = "GSM:";
    translations.ger.email = "Email:";
    translations.ger.our_team = "Unser Team";
    translations.ger.role_director = "Geschäftsführer";
    translations.ger.role_accounting = "Buchhaltung";
    translations.ger.role_bookkeeping = "Buchhaltung";
    translations.ger.role_commerce_logistics = "Handel, Logistik";
    translations.ger.role_commerce_procurement = "Handel, Beschaffung";
    translations.ger.role_commerce = "Handel";
    translations.ger.role_alenka = "Deckt die Region Pomurje, Prlekija und die Oststeiermark ab";
    translations.ger.role_damjan = "Deckt die Region Weststeiermark, Kärnten, Celje-Becken und Posavje ab";
    translations.ger.role_dusan = "Deckt die Region West- und Südslowenien ab";
    translations.ger.role_zala = "Deckt die Region West- und Südslowenien ab";
    translations.ger.event_images = "Bilder von verschiedenen Veranstaltungen";
    translations.ger.event_25th_anniversary = "Horizont-Clair 25-Jahr-Feier, Škofja Loka, 2018";
    translations.ger.event_hannover_2016 = "Hannover Messe (Besuch) Herbst 2016";
    translations.ger.event_komenda_fall_2016 = "Komenda Messe Herbst 2016";
    translations.ger.event_gudovac_fall_2016 = "Gudovac Messe Herbst 2016";
    translations.ger.event_agra_august_2016 = "Agra Messe August 2016";
    translations.ger.event_komenda_spring_2016 = "Komenda Messe Frühling 2016";
    translations.ger.event_gudovac_spring_2016 = "Gudovac Messe Frühling 2016";
    translations.ger.event_komenda_fall_2015 = "Komenda Messe Herbst 2015";
    translations.ger.event_agra_2015 = "Agra Messe 2015 Gornja Radgona";
    translations.ger.event_excursion_2015 = "Exkursion 2015 zum Unternehmen Horizont in Deutschland anlässlich des 70. Jahrestags der Weidegeräteproduktion";
    translations.ger.event_agra_2013 = "Agra Messe Gornja Radgona 2013";
    translations.ger.event_agra_2010 = "Agra Messe Gornja Radgona 2010";
    translations.ger.event_korbach_2010 = "Fachexkursion Korbach (Horizont) | 28.-30. Jan. 2010";
    translations.ger.event_agra_2009 = "Agra Messe Gornja Radgona | 28. Aug. - 5. Sep. 2009";
    translations.ger.event_novi_sad_2009 = "Landwirtschaftsmesse Novi Sad | 10.-16. Mai 2009";
    translations.ger.event_hunting_fishing_2009 = "Jagd- und Angelmesse Gornja Radgona | 17.-19. Apr. 2009";
    translations.ger.event_store_opening_novi_sad = "Eröffnung des Geschäfts in Novi Sad | 18. Okt. 2008";
    translations.ger.event_kzs_2008 = "KŽS Gornja Radgona | 23.-29. Aug. 2008";
    translations.ger.event_store_opening_dogose = "Eröffnung des Geschäfts in Dogoše | 8. Sep. 2007";
    translations.ger.event_hunting_fishing_2007 = "Jagd- und Angelmesse Gornja Radgona | 20.-22. Apr. 2007";
    translations.ger.event_megra_2007 = "Megra, Gornja Radgona | 27.-31. März 2007";
    translations.ger.event_kzs_2006 = "KŽS Gornja Radgona | 26. Aug. - 1. Sep. 2006";
    // Continue for all keys...

    // Add Croatian translations
    translations.cro.company_name = "Horizont-Clair d.o.o.";
    translations.cro.locations_contact = "Lokacije i Kontakt informacije";
    translations.cro.store_zbilje = "Trgovina i Sjedište Zbilje";
    translations.cro.store_maribor = "Trgovina Maribor";
    translations.cro.store_novi_sad = "Trgovina Novi Sad, Srbija";
    translations.cro.warehouse = "Skladište";
    translations.cro.tel = "Telefon:";
    translations.cro.gsm = "GSM:";
    translations.cro.email = "Email:";
    translations.cro.our_team = "Naš Tim";
    translations.cro.role_director = "Direktor Tvrdke";
    translations.cro.role_accounting = "Računovodstvo";
    translations.cro.role_bookkeeping = "Knjigovodstvo";
    translations.cro.role_commerce_logistics = "Komerciala, Logistika";
    translations.cro.role_commerce_procurement = "Komerciala, Nabava";
    translations.cro.role_commerce = "Komerciala";
    translations.cro.role_alenka = "Pokriva područje Pomurja, Prlekije i istočne Štajerske";
    translations.cro.role_damjan = "Pokriva područje zapadne Štajerske, Koruške, Celjske kotline i Posavja.";
    translations.cro.role_dusan = "Pokriva područje zapadne i južne Slovenije";
    translations.cro.role_zala = "Pokriva područje zapadne i južne Slovenije";
    translations.cro.event_images = "Slike s raznih događaja";
    translations.cro.event_25th_anniversary = "Jubilarna proslava Horizont-Clair 25. obljetnica, Škofja Loka, 2018";
    translations.cro.event_hannover_2016 = "Sajam Hannover (posjet) jesen 2016";
    translations.cro.event_komenda_fall_2016 = "Sajam Komenda jesen 2016";
    translations.cro.event_gudovac_fall_2016 = "Sajam Gudovac jesen 2016";
    translations.cro.event_agra_august_2016 = "Sajam Agra kolovoz 2016";
    translations.cro.event_komenda_spring_2016 = "Sajam Komenda proljeće 2016";
    translations.cro.event_gudovac_spring_2016 = "Sajam Gudovac proljeće 2016";
    translations.cro.event_komenda_fall_2015 = "Sajam Komenda jesen 2015";
    translations.cro.event_agra_2015 = "Sajam Agra 2015 Gornja Radgona";
    translations.cro.event_excursion_2015 = "Ekskurzija 2015 u tvrtku Horizont u Njemačkoj povodom 70. obljetnice proizvodnje opreme za pašu";
    translations.cro.event_agra_2013 = "Sajam Agra Gornja Radgona 2013";
    translations.cro.event_agra_2010 = "Sajam Agra Gornja Radgona 2010";
    translations.cro.event_korbach_2010 = "Stručna ekskurzija Korbach (Horizont) | 28.-30. siječ. 2010";
    translations.cro.event_agra_2009 = "Sajam Agra Gornja Radgona | 28. kol. - 5. ruj. 2009";
    translations.cro.event_novi_sad_2009 = "Poljoprivredni sajam Novi Sad | 10.-16. svib. 2009";
    translations.cro.event_hunting_fishing_2009 = "Sajam lova i ribolova Gornja Radgona | 17.-19. tra. 2009";
    translations.cro.event_store_opening_novi_sad = "Otvaranje trgovine u Novom Sadu | 18. lis. 2008";
    translations.cro.event_kzs_2008 = "KŽS Gornja Radgona | 23.-29. kol. 2008";
    translations.cro.event_store_opening_dogose = "Otvaranje trgovine u Dogošama | 8. ruj. 2007";
    translations.cro.event_hunting_fishing_2007 = "Sajam lova i ribolova Gornja Radgona | 20.-22. tra. 2007";
    translations.cro.event_megra_2007 = "Megra, Gornja Radgona | 27.-31. ožu. 2007";
    translations.cro.event_kzs_2006 = "KŽS Gornja Radgona | 26. kol. - 1. ruj. 2006";

    translations.slo.searching_catalogs = "Iščem po katalogih...";
    translations.eng.searching_catalogs = "Searching catalogs...";
    translations.ger.searching_catalogs = "Durchsuche Kataloge...";
    translations.cro.searching_catalogs = "Pretražujem kataloge...";

    // Add these translation keys:
    translations.slo.view_catalog = "Ogled Kataloga";
    translations.slo.page = "Stran";

    translations.eng.view_catalog = "View Catalog";
    translations.eng.page = "Page";

    translations.ger.view_catalog = "Katalog Ansehen";
    translations.ger.page = "Seite";

    translations.cro.view_catalog = "Pregled Kataloga";
    translations.cro.page = "Stranica";


    // Add to translations.slo
    translations.slo.search_results_for = "Rezultati iskanja za:";
    translations.slo.search_results = "Rezultati iskanja";
    translations.slo.no_results = "Ni rezultatov";
    translations.slo.try_different = "Poizkusite z drugačnim iskalnim pojmom";

    // Add to translations.eng
    translations.eng.search_results_for = "Search results for:";
    translations.eng.search_results = "Search results";
    translations.eng.no_results = "No results";
    translations.eng.try_different = "Try a different search term";

    // Add to translations.ger
    translations.ger.search_results_for = "Suchergebnisse für:";
    translations.ger.search_results = "Suchergebnisse";
    translations.ger.no_results = "Keine Ergebnisse";
    translations.ger.try_different = "Versuchen Sie einen anderen Suchbegriff";

    // Add to translations.cro
    translations.cro.search_results_for = "Rezultati pretrage za:";
    translations.cro.search_results = "Rezultati pretrage";
    translations.cro.no_results = "Nema rezultata";
    translations.cro.try_different = "Pokušajte s drugim pojmom za pretraživanje";

    translations.slo.page = "Stran";
    translations.slo.of = "od";

    translations.eng.page = "Page";
    translations.eng.of = "of";

    translations.ger.page = "Seite";
    translations.ger.of = "von";

    translations.cro.page = "Stranica";
    translations.cro.of = "od";



    // Navigation history management with proper state handling
    const navigationHistory = {
        history: [],
        currentIndex: -1,
        
        // Add a new state to history
        pushState: function(state) {
            // If we're not at the end of history, remove future states
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }

          // Only push state if it's different from the current state
          const currentState = this.getCurrentState();
          if (!currentState || JSON.stringify(state) !== JSON.stringify(currentState)) {
            // Make sure we store all necessary information for search results
            if (state.type === VIEW_TYPES.SEARCH && state.searchQuery) {
                const langTranslations = translations[currentLanguage] || translations.slo;
                state.translatedTitle = `${langTranslations.search_results_for} ${state.searchQuery}`;
            }
            
            this.history.push(JSON.parse(JSON.stringify(state)));
            this.currentIndex = this.history.length - 1;

            window.history.pushState({ 
                isCustomState: true, 
                index: this.currentIndex 
            }, "", `#state-${this.currentIndex}`);
            
            // Update URL hash without adding to browser history
            this.updateBrowserHistory();
            
            this.updateBackButtonVisibility();
            }
        },
        
        // Go back to previous state
        goBack: function() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateBrowserHistory();
                this.updateBackButtonVisibility();
                return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
            }
            return null;
        },
        
        // Get current state
        getCurrentState: function() {
            if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
                return this.history[this.currentIndex];
            }
            return null;
        },
        
        // Clear history
        clear: function() {
            this.history = [];
            this.currentIndex = -1;
            window.location.hash = '';
            this.updateBackButtonVisibility();
        },
        
        // Update browser history without adding a new entry
        updateBrowserHistory: function() {
            // Use replaceState to avoid creating new history entries
            const state = this.getCurrentState();
            if (state) {
                const url = window.location.href.split('#')[0] + `#state-${this.currentIndex}`;
                window.history.replaceState({index: this.currentIndex}, '', url);
            }
        },
        
        // Update back button visibility
        updateBackButtonVisibility: function() {
            if (backButtonContainer) {
                if (this.currentIndex > 0) {
                    backButtonContainer.style.display = 'block';
                } else {
                    backButtonContainer.style.display = 'none';
                }
            }
        }
    };

    
    // View state types
    const VIEW_TYPES = {
        INITIAL: 'initial',
        PDF: 'pdf',
        ABOUT: 'about',
        B2B: 'b2b',
        SEARCH: 'search'
    };




    
    // Current language
    let currentLanguage = 'slo';

    // Function to collect all PDFs from navigation
    function collectAllPdfs() {
        const pdfs = [];
        const seenPdfs = new Set(); // Track unique PDFs

        // Helper function to get category from menu ID
        function getCategory(menuId) {
            if (menuId.includes('konjenistvo')) return 'konjenistvo';
            if (menuId.includes('kmetijstvo')) return 'kmetijstvo';
            if (menuId.includes('mesarska')) return 'mesarska';
            return 'other';
        }

        // Get all dropdown menus
        const menuIds = ['konjenistvoMenu', 'kmetijstvoMenu', 'mesarskaMenu'];
        
       menuIds.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                const items = menu.querySelectorAll('.nav-dropdown-item');
                items.forEach(item => {
                    const pdfPath = item.getAttribute('data-pdf');
                    const titleKey = item.getAttribute('data-title-key');
                    
                    if (pdfPath) {
                        // Extract base PDF name without page parameters for comparison
                        const basePdfName = pdfPath.split('#')[0];
                        
                        // Only add if we haven't seen this PDF before
                        if (!seenPdfs.has(basePdfName)) {
                            seenPdfs.add(basePdfName);
                            pdfs.push({
                                title: titleKey,
                                pdf: basePdfName, // Store without page parameters
                                category: getCategory(menuId)
                            });
                        }
                    }
                });
            }
        });
    
    return pdfs;
    }

    // Function to extract text from a PDF with page information
    async function extractTextFromPdf(pdfUrl) {
        try {
            // Check if we already have this PDF text cached
            if (pdfTextCache[pdfUrl]) {
                return pdfTextCache[pdfUrl];
            }
            
            console.log(`Extracting text from: ${pdfUrl}`);
            
            // Load the PDF document
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            const pageTexts = [];
            
            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
                pageTexts.push({
                    text: pageText,
                    pageNum: i
                });
            }
            
            // Cache the extracted text with page information
            pdfTextCache[pdfUrl] = {
                fullText: fullText,
                pageTexts: pageTexts
            };
            
            return pdfTextCache[pdfUrl];
        } catch (error) {
            console.error(`Error extracting text from ${pdfUrl}:`, error);
            return { fullText: '', pageTexts: [] };
        }
    }

   // Function to find the page number where search terms appear
    function findPageWithSearchTerms(pageTexts, searchTerms) {
        for (const page of pageTexts) {
            const pageText = page.text.toLowerCase();
            
            for (const term of searchTerms) {
                if (pageText.includes(term.toLowerCase())) {
                    return page.pageNum;
                }
            }
        }
        return 1; // Default to first page if no match found
    }


    // Function to perform Slovenian stemming
    function slovenianStem(word) {
        // Basic Slovenian stemming rules
        const suffixes = [
            'i', 'ji', 'e', 'je', 'a', 'ja', 'o', 'jo', 'ov', 'ev', 'ove', 'eve',
            'em', 'om', 'ami', 'imi', 'ih', 'ih', 'ega', 'emu', 'em', 'im', 'imi',
            'ih', 'ega', 'emu', 'em', 'im', 'imi', 'ih', 'ega', 'emu', 'em', 'im'
        ];
        
        let stemmed = word.toLowerCase();
        
        // Try to remove suffixes
        for (const suffix of suffixes) {
            if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
                stemmed = stemmed.slice(0, -suffix.length);
                break;
            }
        }
        
        return stemmed;
    }

    // Function to generate search terms with stemming
    function generateSearchTerms(query, useStemming = false) {
        const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        
        if (!useStemming) {
            return terms;
        }
        
        // Apply stemming to each term
        const stemmedTerms = terms.map(term => slovenianStem(term));
        return [...new Set([...terms, ...stemmedTerms])]; // Remove duplicates
    }




    // Function to generate a preview snippet with highlighted terms
    function generatePreview(text, searchTerms) {
        // Find the first occurrence of any search term
        let firstIndex = -1;
        
        for (const term of searchTerms) {
            const index = text.toLowerCase().indexOf(term.toLowerCase());
            if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
                firstIndex = index;
            }
        }
        
        if (firstIndex === -1) {
            return text.substring(0, 150) + '...';
        }
        
        // Extract a snippet around the first occurrence
        const start = Math.max(0, firstIndex - 50);
        const end = Math.min(text.length, firstIndex + 100);
        
        let preview = text.substring(start, end);
        
        if (start > 0) {
            preview = '...' + preview;
        }
        
        if (end < text.length) {
            preview = preview + '...';
        }
        
        // Highlight all search terms
        for (const term of searchTerms) {
            const regex = new RegExp(term, 'gi');
            preview = preview.replace(regex, match => 
                `<span class="highlight">${match}</span>`
            );
        }
        
        return preview;
    }

    


    
   // Replace the searchInPdfs function with this updated version
async function searchInPdfs(query, useStemming) {
    const searchTerms = generateSearchTerms(query, useStemming);
    const results = [];
    
    for (const pdf of allPdfs) {
        try {
            const { fullText, pageTexts } = await extractTextFromPdf(pdf.pdf);
            
            // Check if any search term exists in the text
            let found = false;
            let matches = [];
            
            // Process each page
            for (const page of pageTexts) {
                let pageMatches = [];
                
                // Check each search term
                for (const term of searchTerms) {
                    if (page.text.toLowerCase().includes(term.toLowerCase())) {
                        found = true;
                        
                        // Create a snippet with highlighted term
                        const index = page.text.toLowerCase().indexOf(term.toLowerCase());
                        const start = Math.max(0, index - 50);
                        const end = Math.min(page.text.length, index + 100);
                        let snippet = page.text.substring(start, end);
                        if (start > 0) snippet = '...' + snippet;
                        if (end < page.text.length) snippet = snippet + '...';
                        
                        // Highlight the term
                        snippet = snippet.replace(
                            new RegExp(term, 'gi'), 
                            match => `<span class="highlight">${match}</span>`
                        );
                        
                        pageMatches.push({
                            page: page.pageNum,
                            text: snippet
                        });
                        
                        // Stop if we have 4 matches for this page
                        if (pageMatches.length >= 4) break;
                    }
                }
                
                // Add page matches to our total matches
                matches = matches.concat(pageMatches);
                
                // If we have enough matches, break early
                if (matches.length >= 20) break; // Limit total matches per catalog
            }
            
            if (found && matches.length > 0) {
                // Get the translated title
                const langTranslations = translations[currentLanguage] || translations.slo;
                const title = langTranslations[pdf.title] || pdf.title;
                
                results.push({
                    title: title,
                    pdf: pdf.pdf,
                    category: pdf.category,
                    matches: matches,
                    searchTerms: searchTerms
                });
            }
        } catch (error) {
            console.error(`Error processing ${pdf.pdf}:`, error);
        }
    }
    
    // Sort by relevance (number of matches)
    return results.sort((a, b) => b.matches.length - a.matches.length);
}






    // Function to perform PDF search
    async function performPdfSearch(query) {
        // First search without stemming
        let results = await searchInPdfs(query, false);
        
        // If less than 5 results, try with stemming
        if (results.length < 5) {
            const stemmedResults = await searchInPdfs(query, true);
            
            // Merge results, avoiding duplicates
            const existingIds = new Set(results.map(r => r.pdf));
            for (const result of stemmedResults) {
                if (!existingIds.has(result.pdf)) {
                    results.push(result);
                    existingIds.add(result.pdf);
                }
            }
        }
        
        return results;
    }





    // Modified performSearch to handle history properly
    async function performSearch(noHistoryUpdate = false) {

         if (typeof noHistoryUpdate !== 'boolean') {
           console.warn('performSearch called with invalid parameter, defaulting to false, because true caused back navigation errors');
            noHistoryUpdate = false;
        }

        const query = searchInput.value.trim();
        const langTranslations = translations[currentLanguage] || translations.slo;
        
        if (query.length < 2) {
            showMessage('Vnesite vsaj 2 znaka za iskanje.', 'warning');
            return;
        }
        
        // Update current view state
        currentView = {
            type: VIEW_TYPES.SEARCH,
            searchQuery: query,
            translatedTitle: `${langTranslations.search_results_for} ${query}`
        };
        
        // Add to navigation history unless instructed not to
        if (!noHistoryUpdate) {
            navigationHistory.pushState(currentView);
        }
        
        // Update page title
        //langTranslations = translations[currentLanguage] || translations.slo;
        pageTitle.textContent = `${langTranslations.search_results_for} ${query}`;
        
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${langTranslations.searching_catalogs}</p>
            </div>
        `;
        
        showContent(searchResultsSection, currentView, noHistoryUpdate);
        
        // Collect all PDFs if not already done
        if (allPdfs.length === 0) {
            allPdfs = collectAllPdfs();
        }
        
        // Perform the search
        const results = await performPdfSearch(query);
        
        // Store results in current view
        currentView.searchResults = results;
        
        // Update navigation history with results
        if (navigationHistory.currentIndex >= 0) {
            navigationHistory.history[navigationHistory.currentIndex].searchResults = results;
            navigationHistory.updateBrowserHistory();
        }
        
        // Display results
        displaySearchResults(results, query);
    }





    
    // Alternative highlighting method for difficult cases
    function highlightSearchTermsAggressive(svg, textContent, viewport, searchTerms) {
        const textItems = textContent.items;
        const searchTermSet = new Set(searchTerms.map(term => term.toLowerCase()));
        
        textItems.forEach(item => {
            const text = item.str.toLowerCase();
            
            for (const term of searchTermSet) {
                // Try a more aggressive matching approach
                if (text.includes(term) || term.includes(text)) {
                    const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
                    
                    const x = transform[4];
                    const y = transform[5];
                    const width = item.width * pdfViewer.currentZoom;
                    const height = item.height * pdfViewer.currentZoom;
                    
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', x);
                    rect.setAttribute('y', y - height);
                    rect.setAttribute('width', width);
                    rect.setAttribute('height', height);
                    rect.setAttribute('fill', 'rgba(255, 200, 0, 0.6)'); // Different color for aggressive matches
                    rect.setAttribute('class', 'text-highlight-aggressive');
                    rect.setAttribute('opacity', '0');
                    
                    svg.appendChild(rect);
                    
                    setTimeout(() => {
                        rect.setAttribute('opacity', '1');
                    }, 100);
                    
                    break;
                }
            }
        });
    }







    
 // Replace the displaySearchResults function with this updated version
function displaySearchResults(results, query) {
    // Calculate total matches (sum of all matches across all catalogs)
    const totalMatches = results.reduce((sum, result) => sum + result.matches.length, 0);
    const langTranslations = translations[currentLanguage] || translations.slo;
    resultsCount.textContent = `${langTranslations.search_results}: ${totalMatches}`;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="bi bi-search" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h4>${langTranslations.no_results} "${query}"</h4>
                    <p>${langTranslations.try_different}</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    results.forEach((result, index) => {
        // Add separator if not the first result
        if (index > 0) {
            html += `<div style="height: 2px; background-color: var(--secondary); margin: 20px 0;"></div>`;
        }

        html += `
            <div class="result-item">
                <h3 class="result-title">${result.title}</h3>
                <div class="result-preview">
        `;

        // Add each match with a direct page button
        result.matches.forEach(match => {
            html += `
                <div style="margin-bottom: 15px;">
                    <div>${match.text}</div>
                    <button class="action-btn view-btn" style="margin-top: 8px;" 
                            data-pdf="${result.pdf}" 
                            data-title="${result.title}" 
                            data-page="${match.page}" 
                            data-terms='${JSON.stringify(result.searchTerms)}'>
                        <i class="bi bi-eye"></i> ${langTranslations.view_catalog} (${langTranslations.page} ${match.page})
                    </button>
                    <hr style="border: dotted 1px #0000000;" />
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pdfPath = this.dataset.pdf;
            const titleKey = this.dataset.title;
            const pageNumber = parseInt(this.dataset.page) || 1;
            const searchTerms = JSON.parse(this.dataset.terms || '[]');
            
            showPDF(pdfPath, titleKey, pageNumber, searchTerms);
        });
    });
}







    // Show random wisdom in footer (Slovenian only)
function showFooterWisdom() {
    // Traditional wisdom quotes (your existing ones)
    const wisdomQuotes = [
        "Dobro delo je temelj srečnega življenja. - Tradicionalni Pregovor",
        "Orodje mora služiti človeku, ne obratno. - Kmetijski Pregovor", 
        "Kmetijska tradicija je zaklad vsakega naroda. - Kmetijski Pregovor",
        "Zemlja ne laže, tisti ki jo obdeluje z ljubeznijo, dobi obilje. - Kmetijski Pregovor",
        "Najlepši sadovi rastejo iz potnega dela. - Star Pregovor",
        "Kakovost se vedno povrne. - Horizont Clair",
        "Trajnostno kmetijstvo je prihodnost. - Janez Novak",
        "Uspeh kmetije je v ravnovesju z naravo. - Ekoloski svetovalec"
    ];

    // Weather folklore quotes grouped by month (0 = January, 11 = December)
    const weatherQuotesByMonth = [
        [ // January (0)
            "Januarska zima, bogata jesen - kmetje bodo veseli.",
            "Če januarja led debel raste, bogato leto nam obljublja.",
            "Sneženi januar, zlata jesen - tako pravijo stari kmetje.",
            "Januarjev mraz pomeni zdravo zemljo za spomlad.",
            "Kolikor januarja sneži, toliko bo jeseni rodilo."
        ],
        [ // February (1)
            "Februarjev veter napoveduje zgodnjo pomlad.",
            "Če februarja sonce sije, zgodnje sejanje se pripravlja.",
            "Februarska megla - marčevska slana bo.",
            "Kratki februar, dolga letina - tako pravi modrost.",
            "Februarjev sneg je kot gnojilo za zemljo."
        ],
        [ // March (2)
            "Marčevo sonce greje kot pečica za seme.",
            "Če marec suh, bo april moker - tako veščina uči.",
            "Marčev veter piha, setev pripravlja.",
            "Marec bel, rodoviten del - stari pregovor.",
            "Marčev dež je kot pijača za zemljo."
        ],
        [ // April (3)
            "Aprilski dež rosi, polja se budijo.",
            "Če aprilijsko cvetje, bogato leto obeta.",
            "Aprilsko vreme je kot otrok - spremenljivo in polno presenečenj.",
            "Aprilski vetrovi seme v zemljo vtepajo.",
            "Dež v aprilu je bolj vreden kot zlato."
        ],
        [ // May (4)
            "Majski dež pomeni rast in obilje.",
            "Če maj rosi, se polja sladkajo.",
            "Majska toplota - zgodnji pridelek čaka.",
            "Maj cvetoč, jesen bogata - tako pravi modrost.",
            "V maju dež - v žitu lež."
        ],
        [ // June (5)
            "Junij toploten, žito zoren.",
            "Če junij vroč, bo žito košat.",
            "Junijski sonce zori kakor pečica kruh.",
            "Junij deževen - september zlaten.",
            "V juniju toplota, v kašči obilja."
        ],
        [ // July (6)
            "Julij vroč, žito pečeno in zrelo.",
            "Če julij suh, kmetje bodo veseli.",
            "Julijsko sonce - zlato za žito.",
            "V juliju vročina, v kašči polnina.",
            "Julij deževen - jesen žalostna."
        ],
        [ // August (7)
            "Avgustovo zlato - žito zrelo in bogato.",
            "Avgustov dež je kot solza radosti za kmeta.",
            "Če avgust toploten, bo trgatev sladka.",
            "Avgustovo vreme napoveduje jesensko setev.",
            "V avgustu sonce, v kašči zlato."
        ],
        [ // September (8)
            "Septembra rosa - zdrava setev za prihodnost.",
            "Če september topel, bo jesen dolga in rodovitna.",
            "Septembrski veter seme v zemljo polaga.",
            "September suh - jesen bogata.",
            "V septembru dež - v zemlji zaklad."
        ],
        [ // October (9)
            "Oktobrska hladnost - zemlja se pripravlja na počitek.",
            "Če oktober moker, bo pomlad sušna.",
            "Oktobrska megla - znamenje spremembe.",
            "Oktober sončen - dober predznak za zimo.",
            "V oktobru listje pade, zemlja miruje."
        ],
        [ // November (10)
            "Novembra megla - zima bo zgodnja.",
            "Če november moker, bo zima blaga.",
            "Novembrska hladnost zemljo očisti.",
            "November veter - znamenje spremembe.",
            "V novembru dež - pomladi korist."
        ],
        [ // December (11)
            "December mrzel - pomlad zgodnja.",
            "Če decembra sneg, bo leto bogato.",
            "Decemberska zima zemljo ojača.",
            "December bel - rodoviten del.",
            "V decembru mraz - v zemlji zaklad."
        ]
    ];

    // 50/50 chance logic
    const isWeatherQuote = Math.random() < 0.5;
    const currentMonth = new Date().getMonth(); // 0-11
    
    let selectedQuote;

    if (isWeatherQuote && weatherQuotesByMonth[currentMonth]) {
        // Get a random weather quote for current month
        const monthQuotes = weatherQuotesByMonth[currentMonth];
        const randomIndex = Math.floor(Math.random() * monthQuotes.length);
        selectedQuote = monthQuotes[randomIndex];
        
    } else {
        // Get a random traditional wisdom quote
        const randomIndex = Math.floor(Math.random() * wisdomQuotes.length);
        selectedQuote = wisdomQuotes[randomIndex];
        
    }

    // Display the selected quote
    footerWisdomText.textContent = selectedQuote;
    wisdomContainer.classList.add('active');
}



    function updateStatusBarTranslation() {
        const statusBar = document.querySelector('.status-bar');
        if (!statusBar) return;
        
        const langTranslations = translations[currentLanguage] || translations.slo;
        
        // Find all translatable elements within the status bar
        const translatableElements = statusBar.querySelectorAll('[data-translate]');
        
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (langTranslations[key]) {
                element.textContent = langTranslations[key];
            }
        });
        
        // Ensure page numbers are preserved
        const currentPageElement = document.getElementById('currentPage');
        const totalPagesElement = document.getElementById('totalPages');
        
        if (currentPageElement && pdfViewer.currentPage) {
            currentPageElement.textContent = pdfViewer.currentPage;
        }
        
        if (totalPagesElement && pdfViewer.totalPages) {
            totalPagesElement.textContent = pdfViewer.totalPages;
        }
    }





   
   // Modified showPDF to handle history properly
   function showPDF(pdfPath, titleKey, pageNumber = 1, searchTerms = [], state = null, noHistoryUpdate = false) {
        // Clear previous search terms and text layers
        currentSearchTerms = [];
        textLayerDivs = [];
        
        // Update current view state
        currentView = state || {
            type: VIEW_TYPES.PDF,
            titleKey: titleKey,
            pdfTitleKey: titleKey,
            pdfPath: pdfPath,
            searchTerms: searchTerms,
            pageNumber: pageNumber
        };

        if (!noHistoryUpdate) {
            window.history.pushState({ 
                isCustomState: true, 
                index: navigationHistory.currentIndex 
            }, "", `#state-${navigationHistory.currentIndex}`);
        }

        pdfViewer.currentZoom = 1.1;
        zoomLevel.textContent = '110%';
        
        // Add to navigation history unless instructed not to
        if (!noHistoryUpdate) {
            navigationHistory.pushState(currentView);
        }
        
        // Update page title
        const langTranslations = translations[currentLanguage] || translations.slo;
        pageTitle.textContent = langTranslations[titleKey] || titleKey;
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        pdfViewerContainer.innerHTML = '';
        
        // Store the target page number and search terms
        window.targetPdfPage = pageNumber;
        currentSearchTerms = searchTerms;
        
        // Improved PDF loading with better error handling
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        
        loadingTask.promise.then(pdfDoc => {
            handlePDFLoaded(pdfDoc);
        }).catch(err => {
            console.error('Error loading PDF:', err);
            
            // Enhanced error handling
            if (err.name === 'InvalidPDFException') {
                showMessage('Napaka pri nalaganju PDF: Neveljaven format', 'error');
            } else if (err.name === 'MissingPDFException') {
                showMessage('PDF datoteka ni bila najdena', 'error');
            } else if (err.name === 'UnexpectedResponseException') {
                showMessage('Napaka pri komunikaciji s strežnikom', 'error');
            } else {
                showMessage('Napaka pri nalaganju kataloga', 'error');
            }
            
            loadingIndicator.style.display = 'none';
            
            // Add a retry button
            const retryButton = document.createElement('button');
            retryButton.className = 'btn btn-primary mt-3';
            retryButton.textContent = 'Poskusi znova';
            retryButton.onclick = () => showPDF(pdfPath, titleKey, pageNumber, searchTerms, state, noHistoryUpdate);
            
            pdfViewerContainer.innerHTML = `
                <div class="text-center p-5">
                    <i class="bi bi-file-earmark-pdf-fill" style="font-size: 3rem; color: #dc3545;"></i>
                    <h4 class="mt-3">Napaka pri nalaganju kataloga</h4>
                    <p>Kataloga ni bilo mogoče naložiti. Preverite povezavo do datoteke.</p>
                </div>
            `;
            pdfViewerContainer.querySelector('.text-center').appendChild(retryButton);
        });
        
        showContent(contentDisplay, currentView, noHistoryUpdate);
    }








  // Modified handlePDFLoaded function
    function handlePDFLoaded(pdfDoc) {
        pdfViewer.doc = pdfDoc;
        pdfViewer.totalPages = pdfDoc.numPages;
        
        // Use the target page if set, otherwise default to page 1
        pdfViewer.currentPage = window.targetPdfPage || 1;
        
        totalPagesSpan.textContent = pdfViewer.totalPages;
        currentPageSpan.textContent = pdfViewer.currentPage;

        updateStatusBarTranslation();
        
        // Apply mobile optimization
        optimizeForMobile();
        
        renderPDFPages();
        loadingIndicator.style.display = 'none';
        
        // Clear the target page after use
        window.targetPdfPage = null;
    }



    const isMobilePDF = () => window.matchMedia('(max-width: 768px)').matches;
    let pdfRenderGeneration = 0;

    // Render every catalogue page in document order, stacked vertically.
    // The generation guard prevents stale asynchronous PDF requests from
    // adding pages after the user has switched catalogues.
    function renderPDFPages() {
        const generation = ++pdfRenderGeneration;
        pdfViewerContainer.innerHTML = '';
        resetPDFTouchZoom();
        if (!pdfViewer.doc) return;
        const targetPage = Math.max(1, Math.min(pdfViewer.totalPages, pdfViewer.currentPage));
        const pageSlots = [];
        for (let number = 1; number <= pdfViewer.totalPages; number++) {
            const slot = document.createElement('div');
            slot.className = 'page-container';
            slot.dataset.pageNumber = number;
            slot.id = `pdf-page-${number}`;
            const label = document.createElement('div');
            label.className = 'page-label';
            label.textContent = `Stran ${number}`;
            slot.appendChild(label);
            pdfViewerContainer.appendChild(slot);
            pageSlots.push(slot);
        }
        currentPageSpan.textContent = targetPage;
        // Render sequentially so initial-page navigation and text highlights
        // remain deterministic. These catalogues are typically short.
        (async () => {
            for (let number = 1; number <= pageSlots.length; number++) {
                if (generation !== pdfRenderGeneration) return;
                await renderPage(number, pageSlots[number - 1], generation);
                if (number === targetPage && generation === pdfRenderGeneration) {
                    pageSlots[number - 1].scrollIntoView({ block: 'start', behavior: 'instant' });
                }
            }
        })().catch(error => console.error('PDF rendering error:', error));
    }

    function jumpToPDFPage(number) {
        if (!pdfViewer.doc) return;
        pdfViewer.currentPage = Math.max(1, Math.min(pdfViewer.totalPages, number));
        currentPageSpan.textContent = pdfViewer.currentPage;
        const slot = pdfViewerContainer.querySelector(`[data-page-number="${pdfViewer.currentPage}"]`);
        if (slot) pdfViewerContainer.scrollTo({ top: slot.offsetTop - pdfViewerContainer.offsetTop, behavior: 'smooth' });
    }

    // Track the page currently visible inside the viewer, not the outer window.
    pdfViewerContainer.addEventListener('scroll', () => {
        if (!pdfViewer.doc) return;
        const top = pdfViewerContainer.getBoundingClientRect().top;
        let closest = null;
        let distance = Infinity;
        pdfViewerContainer.querySelectorAll('.page-container').forEach(slot => {
            const delta = Math.abs(slot.getBoundingClientRect().top - top);
            if (delta < distance) { distance = delta; closest = slot; }
        });
        if (closest) {
            pdfViewer.currentPage = Number(closest.dataset.pageNumber);
            currentPageSpan.textContent = pdfViewer.currentPage;
        }
    }, { passive: true });

    // v0.3.2: Touch gestures in the PDF frame. CSS zoom scales the canvas AND
    // its search highlights together, without re-fetching or re-rendering pages.
    // A one-finger gesture scrolls the viewer; two fingers pinch around midpoint.
    const pdfGesture = { pointers: new Map(), startDistance: 0, startZoom: 1, lastX: 0, lastY: 0 };
    let pdfTouchZoom = 1;
    function setPDFTouchZoom(value, x, y) {
        const next = Math.max(1, Math.min(3.5, value));
        if (Math.abs(next - pdfTouchZoom) < 0.001) return;
        const rect = pdfViewerContainer.getBoundingClientRect();
        const localX = x - rect.left;
        const localY = y - rect.top;
        const factor = next / pdfTouchZoom;
        const oldLeft = pdfViewerContainer.scrollLeft;
        const oldTop = pdfViewerContainer.scrollTop;
        pdfTouchZoom = next;
        pdfViewerContainer.querySelectorAll('.page-container').forEach(slot => {
            slot.style.zoom = String(next);
        });
        pdfViewerContainer.scrollLeft = (oldLeft + localX) * factor - localX;
        pdfViewerContainer.scrollTop = (oldTop + localY) * factor - localY;
    }
    function pdfDistance(points) {
        return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }
    pdfViewerContainer.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return;
        pdfGesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        pdfViewerContainer.setPointerCapture(event.pointerId);
        if (pdfGesture.pointers.size === 2) {
            pdfGesture.startDistance = pdfDistance([...pdfGesture.pointers.values()]);
            pdfGesture.startZoom = pdfTouchZoom;
        }
    });
    pdfViewerContainer.addEventListener('pointermove', event => {
        if (!pdfGesture.pointers.has(event.pointerId)) return;
        const previous = pdfGesture.pointers.get(event.pointerId);
        pdfGesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const points = [...pdfGesture.pointers.values()];
        if (points.length >= 2 && pdfGesture.startDistance > 0) {
            const midpointX = (points[0].x + points[1].x) / 2;
            const midpointY = (points[0].y + points[1].y) / 2;
            setPDFTouchZoom(pdfGesture.startZoom * pdfDistance(points) / pdfGesture.startDistance, midpointX, midpointY);
        } else if (points.length === 1) {
            pdfViewerContainer.scrollLeft -= event.clientX - previous.x;
            pdfViewerContainer.scrollTop -= event.clientY - previous.y;
        }
    });
    function endPDFPointer(event) {
        pdfGesture.pointers.delete(event.pointerId);
        pdfGesture.startDistance = 0;
        if (pdfGesture.pointers.size === 2) {
            pdfGesture.startDistance = pdfDistance([...pdfGesture.pointers.values()]);
            pdfGesture.startZoom = pdfTouchZoom;
        }
    }
    pdfViewerContainer.addEventListener('pointerup', endPDFPointer);
    pdfViewerContainer.addEventListener('pointercancel', endPDFPointer);
    // Desktop test: hold Ctrl and use the mouse wheel over the PDF frame.
    pdfViewerContainer.addEventListener('wheel', event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        setPDFTouchZoom(pdfTouchZoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12), event.clientX, event.clientY);
    }, { passive: false });
    function resetPDFTouchZoom() {
        pdfTouchZoom = 1;
        pdfGesture.pointers.clear();
    }

    // Enhanced renderPage function with proper text highlighting
    async function renderPage(pageNum, pageContainer, generation) {
        const page = await pdfViewer.doc.getPage(pageNum);
        if (generation !== pdfRenderGeneration) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(1, pdfViewerContainer.clientWidth - 24);
        const fitScale = Math.min(1.6, availableWidth / baseViewport.width);
        const viewport = page.getViewport({ scale: fitScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = Math.ceil(viewport.height);
        canvas.width = Math.ceil(viewport.width);
        pageContainer.insertBefore(canvas, pageContainer.firstChild);
        await page.render({ canvasContext: context, viewport }).promise;
        if (generation !== pdfRenderGeneration) return;
        if (currentSearchTerms.length > 0) {
            try {
                const textContent = await page.getTextContent();
                if (generation === pdfRenderGeneration) {
                    createHighlightOverlay(pageContainer, textContent, viewport, currentSearchTerms);
                }
            } catch (error) { console.error('Error getting text content:', error); }
        }
    }

    // Function to create a highlight overlay
    function createHighlightOverlay(container, textContent, viewport, searchTerms) {
        // Remove any existing overlay
        const existingOverlay = container.querySelector('.highlight-overlay');
        if (existingOverlay) {
            container.removeChild(existingOverlay);
        }
        
        // Create overlay div
        const overlay = document.createElement('div');
        overlay.className = 'highlight-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none'; // Allow clicks to pass through to the canvas
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        // Create SVG for highlights
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        
        overlay.appendChild(svg);
        
        // Highlight search terms
        highlightSearchTerms(svg, textContent, viewport, searchTerms);
    }



    
    // Improved function to highlight search terms using SVG
    function highlightSearchTerms(svg, textContent, viewport, searchTerms) {
        const textItems = textContent.items;
        
        // Create a set of search terms for faster lookup
        const searchTermSet = new Set(searchTerms.map(term => term.toLowerCase()));
        
        // Process each text item
        textItems.forEach(item => {
            const text = item.str.toLowerCase();
            
            // Check if this text contains any search term
            for (const term of searchTermSet) {
                if (text.includes(term)) {
                    // Calculate position and dimensions
                    const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
                    
                    const x = transform[4];
                    const y = transform[5];
                    const width = item.width * pdfViewer.currentZoom;
                    const height = item.height * pdfViewer.currentZoom;
                    
                    // Create highlight rectangle
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', x);
                    rect.setAttribute('y', y - height); // Adjust Y position
                    rect.setAttribute('width', width);
                    rect.setAttribute('height', height);
                    rect.setAttribute('fill', 'rgba(255, 255, 0, 0.5)');
                    rect.setAttribute('class', 'text-highlight');
                    
                    // Add animation to make the highlight more noticeable
                    rect.setAttribute('opacity', '0');
                    svg.appendChild(rect);
                    
                    // Animate the highlight
                    setTimeout(() => {
                        rect.setAttribute('opacity', '1');
                    }, 100);
                    
                    break; // No need to check other terms for this text item
                }
            }
        });
        
        // If no highlights were found, try a more aggressive search
        if (svg.children.length === 0) {
            highlightSearchTermsAggressive(svg, textContent, viewport, searchTerms);
        }
    }


    wisdomToggleBtn.addEventListener('click', showFooterWisdom);

    wisdomCloseBtn.addEventListener('click', () => {
        wisdomContainer.classList.remove('active');
    }
        );

    // Vertical catalogue navigation. The original button IDs are retained
    // so other existing application code does not lose its references.
    prevPageBtn.addEventListener('click', () => jumpToPDFPage(pdfViewer.currentPage - 1));
    nextPageBtn.addEventListener('click', () => jumpToPDFPage(pdfViewer.currentPage + 1));
    // Kept as hidden compatibility controls; pinch zoom is a later step.
    zoomInBtn.addEventListener('click', () => {});
    zoomOutBtn.addEventListener('click', () => {});

    // Search functionality
    globalSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch(); // Explicitly call without parameters
    });

   searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(); // Explicitly call without parameters
    }
    });

    // Show message
    function showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'info' ? '#d1ecf1' : type === 'warning' ? '#fff3cd' : '#f8d7da'};
            color: ${type === 'info' ? '#0c5460' : type === 'warning' ? '#856404' : '#721c24'};
            border: 1px solid ${type === 'info' ? '#bee5eb' : type === 'warning' ? '#ffeaa7' : '#f5c6cb'};
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 300px;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    }

    // Fixed dropdown functionality for navigation buttons
    function setupDropdowns() {
        // Get all dropdown buttons
        const dropdownButtons = document.querySelectorAll('.nav-dropdown-btn');
        
        dropdownButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Get the menu for this button
                const menu = this.nextElementSibling;
                
                // Close all other menus
                document.querySelectorAll('.nav-dropdown-menu').forEach(m => {
                    if (m !== menu) {
                        m.classList.remove('show');
                    }
                });
                
                // Toggle current menu
                menu.classList.toggle('show');
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }



    // Header scroll behavior with throttling
    let lastScrollTop = 0;
    let throttleTimer;
    
    function handleHeaderScroll() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            header.classList.add("hidden");
        } else {
            header.classList.remove("hidden");
        }
        lastScrollTop = currentScroll;
    }
    
    window.addEventListener('scroll', () => {
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(handleHeaderScroll, 40);
    });



    // Handle browser back/forward buttons
     window.addEventListener('popstate', function(event) {
      const previousState = navigationHistory.goBack();
    
      if (previousState) {
        // Special handling for different view types
        if (previousState.type === VIEW_TYPES.SEARCH && previousState.searchQuery) {
            // For search results, we need to re-run the search to refresh the results
            searchInput.value = previousState.searchQuery;
            performSearch(true);
        } else {
            // For other views, use the standard restoreState
            restoreState(previousState, true);
        }
    } else {
        // Already at first page
        navigationHistory.clear();
        showInitialContent();
    }

    });






    // Function to restore a saved state
    function restoreState(state, fromBrowserHistory = false) {
           // Don't add to history if restoring from browser history
    if (!fromBrowserHistory) {
        navigationHistory.pushState(state);
    }
    
    // Update current view state
    currentView = state;
    
    const langTranslations = translations[currentLanguage] || translations.slo;
    
    switch (state.type) {
        case VIEW_TYPES.INITIAL:
            showInitialContent(true);
            break;
            
        case VIEW_TYPES.ABOUT:
            pageTitle.textContent = langTranslations.about_us || "O nas";
            showContent(aboutSection, state, true);
            break;
            
        case VIEW_TYPES.B2B:
            pageTitle.textContent = langTranslations.b2b || "Veleprodaja (B2B)";
            showContent(b2bSection, state, true);
            break;
            
        case VIEW_TYPES.SEARCH:
            if (state.searchQuery) {
                pageTitle.textContent = `${langTranslations.search_results_for} ${state.searchQuery}`;
                // If we have search results, display them
                if (state.searchResults) {
                    displaySearchResults(state.searchResults, state.searchQuery);
                } else {
                    // If no results, perform the search again
                    searchInput.value = state.searchQuery;
                    performSearch(true);
                    return;
                }
            } else {
                  pageTitle.textContent = langTranslations.search_results_for ? 
                  `${langTranslations.search_results_for} ...` : 
                     "Search Results";
            }
            
            showContent(searchResultsSection, state, true);
            break;
            
        case VIEW_TYPES.PDF:
            showPDF(
                state.pdfPath, 
                state.pdfTitleKey, 
                state.pageNumber || 1, 
                state.searchTerms || [],
                state,
                true
            );
            break;
    }
    }








    // Language selector functionality
    function handleLanguageSelection(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        const flag = this.querySelector('.lang-flag').textContent;
        const text = this.querySelector('.lang-text').textContent.split(' ')[1].replace('(', '').replace(')', '');
        
        // Update dropdown button
        langDropdownBtn.innerHTML = `
            <span>
                <span class="lang-flag">${flag}</span>
                <span class="lang-text">${text}</span>
            </span>
        `;
        
        // Save to localStorage
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;
        currentLanguage = lang;
        currentLang.textContent = text;
        
        if (currentView.type === VIEW_TYPES.PDF && currentView.pdfTitleKey) {
        const langTranslations = translations[currentLanguage] || translations.slo;
        pageTitle.textContent = langTranslations[currentView.pdfTitleKey] || currentView.pdfTitleKey;
}

        // Update content with translations
        applyTranslations();
        
        // Update current view title
        updateCurrentViewTitle();
        
        // Show/hide wisdom container
        toggleWisdomContainer();

        updateStatusBarTranslation();

    }

    langOptions.forEach(option => {
        option.addEventListener('click', handleLanguageSelection);
    });

    // Toggle wisdom container based on language
    function toggleWisdomContainer() {
        if (currentLanguage === 'slo') {
            wisdomToggleBtn.style.display = 'flex';
        } else {
            wisdomToggleBtn.style.display = 'none';
        }
    }

    // Load saved language preference
    function loadLanguagePreference() {
        const savedLang = localStorage.getItem('preferredLang') || 'slo';
        const langData = {
            slo: {flag: "🇸🇮", text: "SLO"},
            eng: {flag: "🇬🇧", text: "ENG"},
            ger: {flag: "🇩🇪", text: "GER"},
            cro: {flag: "🇷🇸🇭🇷", text: "SCR"}
        };
        
        if (langData[savedLang]) {
            const {flag, text} = langData[savedLang];
            langDropdownBtn.innerHTML = `
                <span>
                    <span class="lang-flag">${flag}</span>
                    <span class="lang-text">${text}</span>
                </span>
            `;
            document.documentElement.lang = savedLang;
            currentLanguage = savedLang;
            currentLang.textContent = text;
            applyTranslations();
            toggleWisdomContainer();
        }
    }

    // Apply translations to the page
    function applyTranslations() {
        const langTranslations = translations[currentLanguage] || translations.slo;
        
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (langTranslations[key]) {
            // Check if the translation contains HTML tags
            if (/<[a-z][\s\S]*>/i.test(langTranslations[key])) {
                element.innerHTML = langTranslations[key]; // ← Preserves HTML
            } else {
                element.textContent = langTranslations[key]; // ← Plain text
            }
        }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (langTranslations[key]) {
                element.placeholder = langTranslations[key];
            }
        });
       
    }
    
    // Update current view title
    function updateCurrentViewTitle() {
        const langTranslations = translations[currentLanguage] || translations.slo;
        
        if (currentView.type === 'pdf') {
            const titleKeyToUse = currentView.pdfTitleKey || currentView.titleKey;
            if (titleKeyToUse) {
                pageTitle.textContent = langTranslations[titleKeyToUse] || titleKeyToUse;
            }
        } else if (currentView.type === 'search' && currentView.searchQuery) {
            // Special handling for search results
            pageTitle.textContent = `${langTranslations.search_results_for} ${currentView.searchQuery}`;
        } else if (currentView.titleKey) {
            pageTitle.textContent = langTranslations[currentView.titleKey] || currentView.titleKey;
        }    
    }






  
    
    // Modified showContent to handle history properly
    function showContent(section, state, noHistoryUpdate = false) {
        // Determine view type based on section
        let viewType;
        if (section === aboutSection) {
            viewType = VIEW_TYPES.ABOUT;
        } else if (section === b2bSection) {
            viewType = VIEW_TYPES.B2B;
        } else if (section === searchResultsSection) {
            viewType = VIEW_TYPES.SEARCH;
        } else if (section === contentDisplay) {
            viewType = VIEW_TYPES.PDF;
        }
        
        const langTranslations = translations[currentLanguage] || translations.slo;
        // Update current view state
        currentView = state || {
            type: viewType,
            titleKey: viewType === VIEW_TYPES.ABOUT ? 'about_us' : 
                    viewType === VIEW_TYPES.B2B ? 'b2b' : 
                   
                    currentView.pdfTitleKey || 'pdf'
        };

        if (!noHistoryUpdate) {
            window.history.pushState({ 
                isCustomState: true, 
                index: navigationHistory.currentIndex 
            }, "", `#state-${navigationHistory.currentIndex}`);
        }
        
       if (viewType === VIEW_TYPES.SEARCH && currentView.searchQuery) {
        pageTitle.textContent = `${langTranslations.search_results_for} ${currentView.searchQuery}`;
            } else if (viewType === VIEW_TYPES.PDF && currentView.pdfTitleKey) {
            pageTitle.textContent = langTranslations[currentView.pdfTitleKey] || currentView.pdfTitleKey;
            } else if (currentView.titleKey) {
            pageTitle.textContent = langTranslations[currentView.titleKey] || currentView.titleKey;
            }

        // Add to navigation history unless instructed not to
        if (!noHistoryUpdate) {
            navigationHistory.pushState(currentView);
        }
        
        // Hide initial content
        initialContent.style.display = 'none';
        
        // Hide all content sections
        contentSections.forEach(s => {
            s.style.display = 'none';
        });
        
        // Show requested section
        section.style.display = 'block';
        
        // Scroll to top of content
        window.scrollTo(0, 0);
    }






    
    // Modified showInitialContent to handle history properly
    function showInitialContent(noHistoryUpdate = false) {
        // Update current view state
        currentView = {
            type: VIEW_TYPES.INITIAL,
            titleKey: 'news'
        };

        searchInput.value = '';

        if (!noHistoryUpdate) {
            window.history.pushState({ 
                isCustomState: true, 
                index: navigationHistory.currentIndex 
            }, "", `#state-${navigationHistory.currentIndex}`);
        }
        
        // Add to navigation history unless instructed not to
        if (!noHistoryUpdate) {
            navigationHistory.pushState(currentView);
        }
        
        // Update page title
        const langTranslations = translations[currentLanguage] || translations.slo;
        pageTitle.textContent = langTranslations.news || "Novosti, Aktualno";
        
        // Show initial content
        initialContent.style.display = 'block';
        
        // Hide all content sections
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    }




    
    // Footer button functionality
    aboutBtn.addEventListener('click', () => {
        // Update current view state
        currentView = {
            type: 'about',
            titleKey: 'about_us'
        };
        
        const langTranslations = translations[currentLanguage] || translations.slo;
        pageTitle.textContent = langTranslations.about_us || "O nas";
        
        showContent(aboutSection);
    });
    
    newsBtn.addEventListener('click', showInitialContent);
    
    document.getElementById('facebookBtn').addEventListener('click', () => {
        window.open('https://www.facebook.com/pages/Horizont-Clair/273387802807433', '_blank');
    });
    
    // Shop dropdown functionality
    if (shopDropdown) {
        shopDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            shopDropdown.classList.toggle('show');
        });
    } else {
        console.log('Shop dropdown not found - it might be commented out');
    }
    
    // Close shop dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
       if (!e.target.closest('.footer-dropdown')) {
            document.querySelectorAll('.footer-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
            const menu = dropdown.querySelector('.footer-dropdown-menu');
                if (menu) {
                    menu.style.display = 'none';
                }
            });
        }
        
        // Close navigation dropdowns when clicking outside
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.querySelector('.nav-dropdown-menu').classList.remove('show');
            }
        });
    });






    const shopDropdownToggle = shopDropdown ? shopDropdown.querySelector('.footer-btn') : null;
    if (shopDropdownToggle) {
        shopDropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isShowing = shopDropdown.classList.contains('show');
            
            // Close all other dropdowns first
            document.querySelectorAll('.footer-dropdown').forEach(dropdown => {
                if (dropdown !== shopDropdown) {
                    dropdown.classList.remove('show');
                    const menu = dropdown.querySelector('.footer-dropdown-menu');
                    if (menu) {
                        menu.style.display = 'none';
                    }
                }
            });
            
            // Toggle this dropdown
            if (isShowing) {
                shopDropdown.classList.remove('show');
                const menu = shopDropdown.querySelector('.footer-dropdown-menu');
                if (menu) {
                    menu.style.display = 'none';
                }
            } else {
                shopDropdown.classList.add('show');
                const menu = shopDropdown.querySelector('.footer-dropdown-menu');
                if (menu) {
                    menu.style.display = 'block';
                }
            }
        });
    }


    // Get the retail shop link
    const retailShopLink = document.querySelector('a[href="https://www.agro-clair.si"]');

    // Add event listener to retail shop link to close dropdown
    if (retailShopLink) {
        retailShopLink.addEventListener('click', function(e) {
            // Directly close the dropdown menu by removing the show class
            const dropdownMenu = shopDropdown.querySelector('.footer-dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.style.display = 'none';
            }
            shopDropdown.classList.remove('show');
        
        });
    }




    
    // Modify the B2B button event listener to properly handle navigation
    if (b2bBtn) {
        b2bBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling up
            
            // Close all dropdowns including the shop dropdown
            document.querySelectorAll('.nav-dropdown-menu, .footer-dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
            
            // Also remove show class from dropdown toggle buttons
            document.querySelectorAll('.nav-dropdown-btn, .footer-btn').forEach(btn => {
                btn.classList.remove('show');
            });
            
            const dropdownMenu = shopDropdown.querySelector('.footer-dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.style.display = 'none';
            }
            shopDropdown.classList.remove('show');
            
            // Update current view state
            currentView = {
                type: VIEW_TYPES.B2B,
                titleKey: 'b2b'
            };
            
            // Add to navigation history
            navigationHistory.pushState(currentView);
            
            const langTranslations = translations[currentLanguage] || translations.slo;
            pageTitle.textContent = langTranslations.b2b || "Veleprodaja (B2B)";
            
            showContent(b2bSection);
        });
    }



    // Add a helper function to close all dropdowns
    function closeAllDropdowns() {
        document.querySelectorAll('.nav-dropdown-menu, .footer-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.nav-dropdown-btn, .footer-btn').forEach(btn => {
            btn.classList.remove('show');
        });
    }






    
    // Konjenistvo dropdown items
    document.querySelectorAll('#konjenistvoMenu .nav-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const titleKey = item.dataset.titleKey;
            const pdfPath = item.dataset.pdf;

             // Close the dropdown menu
            const dropdownMenu = item.closest('.nav-dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }

            // Extract page number if specified
            let pageNumber = 1;
            if (pdfPath.includes('#page=')) {
                pageNumber = parseInt(pdfPath.split('#page=')[1]) || 1;
            }

            const cleanPdfPath = pdfPath.split('#')[0];

            showPDF(cleanPdfPath, titleKey, pageNumber);
        });
    });
    
    // Kmetijstvo dropdown items
    document.querySelectorAll('#kmetijstvoMenu .nav-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const titleKey = item.dataset.titleKey;
            const pdfPath = item.dataset.pdf;

             // Close the dropdown menu
            const dropdownMenu = item.closest('.nav-dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }

             // Extract page number if specified
            let pageNumber = 1;
            if (pdfPath.includes('#page=')) {
                pageNumber = parseInt(pdfPath.split('#page=')[1]) || 1;
            }

            const cleanPdfPath = pdfPath.split('#')[0];

            showPDF(cleanPdfPath, titleKey, pageNumber);

        });
    });

    // Mesarska dropdown items
    document.querySelectorAll('#mesarskaMenu .nav-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const titleKey = item.dataset.titleKey;
            const pdfPath = item.dataset.pdf;

             // Close the dropdown menu
            const dropdownMenu = item.closest('.nav-dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }

             // Extract page number if specified
            let pageNumber = 1;
            if (pdfPath.includes('#page=')) {
                pageNumber = parseInt(pdfPath.split('#page=')[1]) || 1;
            }

            const cleanPdfPath = pdfPath.split('#')[0];

            showPDF(cleanPdfPath, titleKey, pageNumber);

        });
    });

   
    

    
        // Function to handle back navigation
    function navigateBack() {
          const previousState = navigationHistory.goBack();
            
            if (!previousState) {
                // No history, just show initial content
                showInitialContent();
                return;
            }

            /*if (navigationHistory.currentIndex > 0) {
                // Use browser's back functionality which will trigger our popstate handler
                window.history.back();
            } else {
                logEvent("Already at the first page");
            }*/
            
            // Special handling for different view types
            if (previousState.type === VIEW_TYPES.SEARCH && previousState.searchQuery) {
                // For search results, we need to re-run the search to refresh the results
                searchInput.value = previousState.searchQuery;
                performSearch(true);
            } else {
                // For other views, use the standard restoreState
                restoreState(previousState, true);
            }
                
                restoreState(previousState);
    }

    
    // Initialize navigation history with initial state
    navigationHistory.pushState({
        type: VIEW_TYPES.INITIAL,
        titleKey: 'news'
    });

    // Ensure back button is hidden initially
    navigationHistory.updateBackButtonVisibility();






/*

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle image loading
    function handleImageLoad(img) {
        img.classList.add('loaded');
        // Hide the placeholder text when image is loaded
        const placeholder = img.parentElement.parentElement.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        // Stop the loading animation
        const container = img.parentElement.parentElement;
        container.style.animation = 'none';
        container.style.background = 'transparent';
    }

    // Function to handle image errors
    function handleImageError(img) {
        console.error('Error loading image:', img.src);
        // Keep the placeholder visible if image fails to load
        const placeholder = img.parentElement.parentElement.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        // Change background to indicate error but keep the animation stopped
        const container = img.parentElement.parentElement;
        container.style.animation = 'none';
        container.style.background = 'rgba(255, 200, 200, 0.3)';
    }

    // Process all images
    const images = document.querySelectorAll('.image-container img');
    
    images.forEach(img => {
        // Check if image is already loaded (cached)
        if (img.complete) {
            handleImageLoad(img);
        } else {
            // Add event listeners for loading and error
            img.addEventListener('load', function() {
                handleImageLoad(this);
            });
            
            img.addEventListener('error', function() {
                handleImageError(this);
            });
        }
    });
    
    // Fallback: If images don't fire events, check status after a delay
    setTimeout(() => {
        images.forEach(img => {
            if (!img.classList.contains('loaded') && img.complete) {
                handleImageLoad(img);
            }
        });
    }, 1000);
});


*/



    function optimizeForMobile() {
        // Layout is handled in mobile.css. Do not reset the current PDF page:
        // it may be a search result or restored navigation state.
        if (isMobilePDF()) {
            const controls = document.querySelector('.pdf-controls');
            if (controls) controls.setAttribute('aria-label', 'PDF navigation and zoom');
        }
    }

    // Reflow the open document when rotating or resizing a device.
    let pdfResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(pdfResizeTimer);
        pdfResizeTimer = setTimeout(() => {
            if (pdfViewer.doc && pdfViewerContainer &&
                document.getElementById('contentDisplay')?.classList.contains('active')) {
                renderPDFPages();
            }
        }, 180);
    });



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





// Customer database experiments from index79 are intentionally excluded.
// A future B2B feature must use a separately secured, authenticated API.

// Firefox-specific background image cache solution
function fixFirefoxBackground() {
    // Check if Firefox
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    if (isFirefox) {
        const timestamp = new Date().getTime();
        const bgImage = `url('HCbg.jpg?firefox=${timestamp}')`;
        
        // Apply with a slight delay to ensure DOM is ready
        setTimeout(() => {
            document.body.style.backgroundImage = bgImage;
            
            // Double-check after a moment
            setTimeout(() => {
                if (document.body.style.backgroundImage !== bgImage) {
                    document.body.style.backgroundImage = bgImage;
                }
            }, 100);
        }, 50);
    }
}
