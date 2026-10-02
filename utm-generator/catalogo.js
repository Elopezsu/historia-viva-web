/* Catálogo del ejercicio: 91 configuraciones en 12 grupos. Generado desde catalogo-canales-utms.json (versión 2026-10-02). */
window.CATALOGO_UTM = {
 "version": "2026-10-02",
 "groups": [
  {
   "name": "Instagram",
   "source": "instagram",
   "medium": "social",
   "note": "Bio, stories, reels, publicaciones, directos y mensajes. La etiqueta identifica el enlace utilizado, no todas las exposiciones anteriores.",
   "presets": [
    {
     "id": "instagram_bio",
     "label": "Bio / enlace del perfil",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "bio",
     "utm_content": "bio_01",
     "access": "Enlace web",
     "detail": "Enlace a la landing o a un hub. Si usas un hub, conserva las UTMs hasta el destino."
    },
    {
     "id": "instagram_story",
     "label": "Story / sticker de enlace",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "story",
     "utm_content": "story_01",
     "access": "Enlace web",
     "detail": "Un enlace por historia o pieza."
    },
    {
     "id": "instagram_destacada",
     "label": "Historia destacada / enlace",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "destacada",
     "utm_content": "destacada_01",
     "access": "Enlace web",
     "detail": "Para distinguirla de la story original necesita su propio enlace. Reutilizar la misma story conserva su etiqueta original."
    },
    {
     "id": "instagram_dm",
     "label": "Mensaje privado manual",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "dm",
     "utm_content": "dm_01",
     "access": "Enlace web",
     "detail": "Enlace enviado en una conversación."
    },
    {
     "id": "instagram_reel_dm",
     "label": "Reel / palabra clave / DM",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "reel_dm",
     "utm_content": "reel_dm_01",
     "access": "Condicionado",
     "detail": "Enlace específico enviado por DM tras el CTA. Requiere respuesta manual o automatización compatible configurada."
    },
    {
     "id": "instagram_post_dm",
     "label": "Post o carrusel / comentario / DM",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "post_dm",
     "utm_content": "post_dm_01",
     "access": "Condicionado",
     "detail": "Identifica el post solo si la respuesta entrega un enlace exclusivo de esa pieza."
    },
    {
     "id": "instagram_story_dm",
     "label": "Respuesta a story / DM",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "story_dm",
     "utm_content": "story_dm_01",
     "access": "Enlace web",
     "detail": "Enviar una URL dedicada en la respuesta."
    },
    {
     "id": "instagram_live_dm",
     "label": "Directo / seguimiento por DM",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "live_dm",
     "utm_content": "live_dm_01",
     "access": "Ruta indirecta",
     "detail": "El CTA ocurre en el directo y el enlace se entrega después por DM."
    },
    {
     "id": "instagram_bio_compartida",
     "label": "Reel, post o directo / ir a la bio",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "bio_compartida",
     "utm_content": "bio_01",
     "access": "Ruta indirecta",
     "detail": "Usar la UTM del enlace de bio. No atribuir el clic a un reel concreto si todos usan esa bio."
    },
    {
     "id": "instagram_canal",
     "label": "Canal de difusión / mensaje",
     "utm_source": "instagram",
     "utm_medium": "social",
     "placement": "canal",
     "utm_content": "canal_01",
     "access": "Condicionado",
     "detail": "Activar si la cuenta permite compartir una URL externa en su canal."
    },
    {
     "id": "instagram_ad_feed",
     "label": "Anuncio en feed",
     "utm_source": "instagram",
     "utm_medium": "paid_social",
     "placement": "ad_feed",
     "utm_content": "ad_feed_01",
     "access": "Condicionado",
     "detail": "Anuncio con destino web. Comprobar formato y ubicación en Ads Manager."
    },
    {
     "id": "instagram_ad_story",
     "label": "Anuncio en stories",
     "utm_source": "instagram",
     "utm_medium": "paid_social",
     "placement": "ad_story",
     "utm_content": "ad_story_01",
     "access": "Condicionado",
     "detail": "Anuncio con destino web."
    },
    {
     "id": "instagram_ad_reel",
     "label": "Anuncio en reels",
     "utm_source": "instagram",
     "utm_medium": "paid_social",
     "placement": "ad_reel",
     "utm_content": "ad_reel_01",
     "access": "Condicionado",
     "detail": "Anuncio con destino web."
    },
    {
     "id": "instagram_ad_dm",
     "label": "Anuncio / mensaje / enlace posterior",
     "utm_source": "instagram",
     "utm_medium": "paid_social",
     "placement": "ad_dm",
     "utm_content": "ad_dm_01",
     "access": "Condicionado",
     "detail": "El primer clic abre mensajes. Esta UTM corresponde al enlace web enviado después."
    }
   ]
  },
  {
   "name": "YouTube",
   "source": "youtube",
   "medium": "video",
   "note": "Shorts y publicaciones no convierten una URL pegada en enlace clicable. Los accesos externos dependen de la superficie y las funciones habilitadas.",
   "presets": [
    {
     "id": "youtube_perfil",
     "label": "Perfil del canal / enlace",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "perfil",
     "utm_content": "perfil_01",
     "access": "Enlace web",
     "detail": "Enlace externo del perfil."
    },
    {
     "id": "youtube_video_descripcion",
     "label": "Vídeo largo / descripción",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "video_descripcion",
     "utm_content": "video_descripcion_01",
     "access": "Condicionado",
     "detail": "Para enlaces externos clicables, habilitar funciones avanzadas."
    },
    {
     "id": "youtube_video_comentario",
     "label": "Vídeo largo / comentario fijado",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "video_comentario",
     "utm_content": "video_comentario_01",
     "access": "Condicionado",
     "detail": "Para enlaces externos clicables, habilitar funciones avanzadas."
    },
    {
     "id": "youtube_live_descripcion",
     "label": "Directo horizontal / descripción",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "live_descripcion",
     "utm_content": "live_descripcion_01",
     "access": "Condicionado",
     "detail": "Comprobar acceso a enlaces externos."
    },
    {
     "id": "youtube_live_chat",
     "label": "Directo horizontal / chat",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "live_chat",
     "utm_content": "live_chat_01",
     "access": "Condicionado",
     "detail": "Probar el enlace. En el feed vertical de la app móvil las URLs no son clicables."
    },
    {
     "id": "youtube_pantalla_final",
     "label": "Pantalla final / sitio externo",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "pantalla_final",
     "utm_content": "pantalla_final_01",
     "access": "Condicionado",
     "detail": "Requiere pertenecer al Programa para Partners y cumplir las políticas de enlaces."
    },
    {
     "id": "youtube_tarjeta",
     "label": "Tarjeta / sitio externo",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "tarjeta",
     "utm_content": "tarjeta_01",
     "access": "Condicionado",
     "detail": "Requiere pertenecer al Programa para Partners y cumplir las políticas de enlaces."
    },
    {
     "id": "youtube_short_video",
     "label": "Short / vídeo relacionado / enlace",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "short_video",
     "utm_content": "short_video_01",
     "access": "Ruta indirecta",
     "detail": "La UTM va en la descripción del vídeo de destino. Solo distingue ese short con una ruta dedicada."
    },
    {
     "id": "youtube_short_perfil",
     "label": "Short / enlace del perfil",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "short_perfil",
     "utm_content": "perfil_01",
     "access": "Ruta indirecta",
     "detail": "Se conserva la etiqueta del perfil. Un enlace compartido no distingue cada short."
    },
    {
     "id": "youtube_post_perfil",
     "label": "Publicación / ruta al perfil",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "post_perfil",
     "utm_content": "perfil_01",
     "access": "Ruta indirecta",
     "detail": "El post dirige al perfil. La medición identifica su enlace, no el post automáticamente."
    },
    {
     "id": "youtube_short_brand",
     "label": "Short patrocinado / enlace de marca",
     "utm_source": "youtube",
     "utm_medium": "video",
     "placement": "short_brand",
     "utm_content": "short_brand_01",
     "access": "Condicionado",
     "detail": "Función especial para acuerdos de marca elegibles. Confirmar acceso."
    },
    {
     "id": "youtube_ad_video",
     "label": "Anuncio de vídeo / CTA web",
     "utm_source": "youtube",
     "utm_medium": "paid_video",
     "placement": "ad_video",
     "utm_content": "ad_video_01",
     "access": "Condicionado",
     "detail": "Configurar URL final en Google Ads y comprobar compatibilidad con su medición."
    },
    {
     "id": "youtube_ad_short",
     "label": "Anuncio en Shorts / CTA web",
     "utm_source": "youtube",
     "utm_medium": "paid_video",
     "placement": "ad_short",
     "utm_content": "ad_short_01",
     "access": "Condicionado",
     "detail": "Usar solo ubicaciones y destinos web disponibles en la cuenta."
    }
   ]
  },
  {
   "name": "TikTok",
   "source": "tiktok",
   "medium": "social",
   "note": "La disponibilidad cambia por cuenta, país y producto. Una descripción, comentario o story no debe ofrecerse como enlace externo directo sin verificar la función.",
   "presets": [
    {
     "id": "tiktok_bio",
     "label": "Perfil / enlace web",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "bio",
     "utm_content": "bio_01",
     "access": "Condicionado",
     "detail": "Activar cuando aparezca la opción de sitio web en el perfil."
    },
    {
     "id": "tiktok_video_bio",
     "label": "Vídeo / ir a la bio",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "video_bio",
     "utm_content": "bio_01",
     "access": "Ruta indirecta",
     "detail": "Usar la etiqueta de bio. No identifica el vídeo si varias piezas comparten enlace."
    },
    {
     "id": "tiktok_story_bio",
     "label": "Story / ir a la bio",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "story_bio",
     "utm_content": "bio_01",
     "access": "Ruta indirecta",
     "detail": "El CTA dirige al perfil y utiliza su enlace."
    },
    {
     "id": "tiktok_live_bio",
     "label": "LIVE / ir a la bio",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "live_bio",
     "utm_content": "bio_01",
     "access": "Ruta indirecta",
     "detail": "El CTA dirige al perfil y utiliza su enlace."
    },
    {
     "id": "tiktok_comentario_bio",
     "label": "Comentario / ir al perfil",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "comentario_bio",
     "utm_content": "bio_01",
     "access": "Ruta indirecta",
     "detail": "Ruta al perfil. No asumir que una URL pegada en comentarios es clicable."
    },
    {
     "id": "tiktok_dm",
     "label": "Mensaje privado / enlace",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "dm",
     "utm_content": "dm_01",
     "access": "Condicionado",
     "detail": "Comprobar permisos de mensajes y apertura de enlaces en la cuenta receptora."
    },
    {
     "id": "tiktok_video_dm",
     "label": "Vídeo / palabra clave / mensaje",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "video_dm",
     "utm_content": "video_dm_01",
     "access": "Condicionado",
     "detail": "Entrega manual o integración compatible. Usar un enlace dedicado y probar la ruta."
    },
    {
     "id": "tiktok_video_destination",
     "label": "Vídeo / Destination Link",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "video_destination",
     "utm_content": "video_destination_01",
     "access": "Condicionado",
     "detail": "Función para negocios verificados elegibles, con requisitos de región y medición."
    },
    {
     "id": "tiktok_comentario_destination",
     "label": "CTA superior en comentarios / Destination Link",
     "utm_source": "tiktok",
     "utm_medium": "social",
     "placement": "comentario_destination",
     "utm_content": "comentario_destination_01",
     "access": "Condicionado",
     "detail": "Usar únicamente la función Destination Links habilitada en la cuenta."
    },
    {
     "id": "tiktok_ad_video",
     "label": "Anuncio de vídeo / sitio web",
     "utm_source": "tiktok",
     "utm_medium": "paid_social",
     "placement": "ad_video",
     "utm_content": "ad_video_01",
     "access": "Condicionado",
     "detail": "Anuncio configurado con URL de destino web."
    },
    {
     "id": "tiktok_ad_spark",
     "label": "Spark Ad / sitio web",
     "utm_source": "tiktok",
     "utm_medium": "paid_social",
     "placement": "ad_spark",
     "utm_content": "ad_spark_01",
     "access": "Condicionado",
     "detail": "Separar la etiqueta del tráfico orgánico y validar la URL usada por el anuncio."
    },
    {
     "id": "tiktok_promote",
     "label": "Promote / visitas al sitio",
     "utm_source": "tiktok",
     "utm_medium": "paid_social",
     "placement": "promote",
     "utm_content": "promote_01",
     "access": "Condicionado",
     "detail": "Disponible al configurar una promoción con objetivo de visitas al sitio."
    }
   ]
  },
  {
   "name": "WhatsApp",
   "source": "whatsapp",
   "medium": "messaging",
   "note": "Se etiqueta la URL web enviada por WhatsApp. Un botón para abrir un chat o unirse a un grupo no demuestra que haya registro en tu CRM.",
   "presets": [
    {
     "id": "whatsapp_chat",
     "label": "Conversación individual",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "chat",
     "utm_content": "chat_01",
     "access": "Enlace web",
     "detail": "Enlace web enviado a una persona."
    },
    {
     "id": "whatsapp_grupo",
     "label": "Grupo / mensaje",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "grupo",
     "utm_content": "grupo_01",
     "access": "Enlace web",
     "detail": "Un identificador por grupo y mensaje."
    },
    {
     "id": "whatsapp_grupo_fijado",
     "label": "Grupo / mensaje fijado",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "grupo_fijado",
     "utm_content": "grupo_fijado_01",
     "access": "Condicionado",
     "detail": "Usar si el mensaje puede fijarse."
    },
    {
     "id": "whatsapp_comunidad",
     "label": "Comunidad / anuncio",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "comunidad",
     "utm_content": "comunidad_01",
     "access": "Condicionado",
     "detail": "Enlace web en el espacio de anuncios disponible."
    },
    {
     "id": "whatsapp_canal",
     "label": "Canal / actualización",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "canal",
     "utm_content": "canal_01",
     "access": "Condicionado",
     "detail": "Enlace web en una actualización."
    },
    {
     "id": "whatsapp_estado",
     "label": "Estado / enlace",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "estado",
     "utm_content": "estado_01",
     "access": "Condicionado",
     "detail": "Probar que el formato de estado permite abrir la URL."
    },
    {
     "id": "whatsapp_difusion",
     "label": "Difusión / mensaje",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "difusion",
     "utm_content": "difusion_01",
     "access": "Condicionado",
     "detail": "Según el producto, plantilla y requisitos de entrega."
    },
    {
     "id": "whatsapp_automatizacion",
     "label": "Automatización / botón URL",
     "utm_source": "whatsapp",
     "utm_medium": "messaging",
     "placement": "automatizacion",
     "utm_content": "automatizacion_01",
     "access": "Condicionado",
     "detail": "Configurar una plantilla o integración compatible con botón de sitio web."
    }
   ]
  },
  {
   "name": "Telegram",
   "source": "telegram",
   "medium": "messaging",
   "note": "Seleccionar el espacio y la pieza. Las opciones de bots requieren una implementación que envíe enlaces web.",
   "presets": [
    {
     "id": "telegram_canal",
     "label": "Canal / publicación",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "canal",
     "utm_content": "canal_01",
     "access": "Enlace web",
     "detail": "Enlace en la publicación."
    },
    {
     "id": "telegram_canal_fijado",
     "label": "Canal / mensaje fijado",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "canal_fijado",
     "utm_content": "canal_fijado_01",
     "access": "Enlace web",
     "detail": "Enlace específico para el mensaje fijado."
    },
    {
     "id": "telegram_grupo",
     "label": "Grupo / mensaje",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "grupo",
     "utm_content": "grupo_01",
     "access": "Enlace web",
     "detail": "Enlace compartido con el grupo."
    },
    {
     "id": "telegram_chat",
     "label": "Chat privado",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "chat",
     "utm_content": "chat_01",
     "access": "Enlace web",
     "detail": "Enlace en conversación individual."
    },
    {
     "id": "telegram_bot",
     "label": "Bot / botón URL",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "bot",
     "utm_content": "bot_01",
     "access": "Condicionado",
     "detail": "El bot debe abrir una URL web."
    },
    {
     "id": "telegram_story",
     "label": "Story / enlace web",
     "utm_source": "telegram",
     "utm_medium": "messaging",
     "placement": "story",
     "utm_content": "story_01",
     "access": "Condicionado",
     "detail": "Activar solo si la cuenta y el formato ofrecen enlaces."
    }
   ]
  },
  {
   "name": "Facebook / Messenger",
   "source": "facebook",
   "medium": "social",
   "note": "Para anuncios usa una UTM por ubicación o parámetros dinámicos verificados. Messenger tiene su propia fuente.",
   "presets": [
    {
     "id": "facebook_pagina",
     "label": "Página / botón web",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "pagina",
     "utm_content": "pagina_01",
     "access": "Condicionado",
     "detail": "Botón disponible con destino a un sitio web."
    },
    {
     "id": "facebook_post",
     "label": "Post / enlace",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "post",
     "utm_content": "post_01",
     "access": "Enlace web",
     "detail": "Enlace compartido en el post."
    },
    {
     "id": "facebook_comentario",
     "label": "Comentario / enlace",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "comentario",
     "utm_content": "comentario_01",
     "access": "Enlace web",
     "detail": "URL en un comentario donde se permita compartir enlaces."
    },
    {
     "id": "facebook_grupo",
     "label": "Grupo / publicación",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "grupo",
     "utm_content": "grupo_01",
     "access": "Enlace web",
     "detail": "Respetar las reglas del grupo."
    },
    {
     "id": "facebook_story",
     "label": "Story / enlace",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "story",
     "utm_content": "story_01",
     "access": "Condicionado",
     "detail": "Solo si la cuenta ofrece un enlace externo."
    },
    {
     "id": "facebook_reel_live",
     "label": "Reel o directo / enlace dedicado",
     "utm_source": "facebook",
     "utm_medium": "social",
     "placement": "reel_live",
     "utm_content": "reel_live_01",
     "access": "Ruta indirecta",
     "detail": "El contenido lleva a un enlace dedicado en otra superficie disponible."
    },
    {
     "id": "facebook_ad",
     "label": "Anuncio / ubicación web",
     "utm_source": "facebook",
     "utm_medium": "paid_social",
     "placement": "ad",
     "utm_content": "ad_01",
     "access": "Condicionado",
     "detail": "Elegir ubicación, pieza y URL en Ads Manager."
    },
    {
     "id": "facebook_messenger_dm",
     "label": "Messenger / mensaje",
     "utm_source": "messenger",
     "utm_medium": "messaging",
     "placement": "messenger_dm",
     "utm_content": "messenger_dm_01",
     "access": "Condicionado",
     "detail": "Fuente messenger y medio messaging para el enlace web enviado."
    }
   ]
  },
  {
   "name": "LinkedIn",
   "source": "linkedin",
   "medium": "social",
   "note": "Opciones para enlaces externos. Revisar las funciones de botones del perfil antes de habilitarlas.",
   "presets": [
    {
     "id": "linkedin_perfil",
     "label": "Perfil / enlace destacado",
     "utm_source": "linkedin",
     "utm_medium": "social",
     "placement": "perfil",
     "utm_content": "perfil_01",
     "access": "Condicionado",
     "detail": "Enlace web en el área disponible del perfil."
    },
    {
     "id": "linkedin_post",
     "label": "Publicación",
     "utm_source": "linkedin",
     "utm_medium": "social",
     "placement": "post",
     "utm_content": "post_01",
     "access": "Enlace web",
     "detail": "URL incluida en el contenido."
    },
    {
     "id": "linkedin_comentario",
     "label": "Comentario",
     "utm_source": "linkedin",
     "utm_medium": "social",
     "placement": "comentario",
     "utm_content": "comentario_01",
     "access": "Enlace web",
     "detail": "URL compartida en un comentario."
    },
    {
     "id": "linkedin_articulo",
     "label": "Artículo o newsletter",
     "utm_source": "linkedin",
     "utm_medium": "social",
     "placement": "articulo",
     "utm_content": "articulo_01",
     "access": "Condicionado",
     "detail": "Enlace del contenido publicado en LinkedIn."
    },
    {
     "id": "linkedin_dm",
     "label": "Mensaje privado",
     "utm_source": "linkedin",
     "utm_medium": "social",
     "placement": "dm",
     "utm_content": "dm_01",
     "access": "Condicionado",
     "detail": "Según permisos de mensajería."
    },
    {
     "id": "linkedin_ad",
     "label": "Anuncio / CTA web",
     "utm_source": "linkedin",
     "utm_medium": "paid_social",
     "placement": "ad",
     "utm_content": "ad_01",
     "access": "Condicionado",
     "detail": "Anuncio con destino web."
    }
   ]
  },
  {
   "name": "X / Threads",
   "source": "x",
   "medium": "social",
   "note": "Separar X y Threads como fuentes. Aquí agrupamos su configuración en el selector de la clase.",
   "presets": [
    {
     "id": "x_perfil",
     "label": "X / perfil",
     "utm_source": "x",
     "utm_medium": "social",
     "placement": "perfil",
     "utm_content": "perfil_01",
     "access": "Enlace web",
     "detail": "Enlace del perfil."
    },
    {
     "id": "x_post",
     "label": "X / publicación",
     "utm_source": "x",
     "utm_medium": "social",
     "placement": "post",
     "utm_content": "post_01",
     "access": "Enlace web",
     "detail": "URL de la publicación."
    },
    {
     "id": "x_respuesta",
     "label": "X / respuesta",
     "utm_source": "x",
     "utm_medium": "social",
     "placement": "respuesta",
     "utm_content": "respuesta_01",
     "access": "Enlace web",
     "detail": "URL en una respuesta."
    },
    {
     "id": "x_threads_perfil",
     "label": "Threads / perfil",
     "utm_source": "threads",
     "utm_medium": "social",
     "placement": "threads_perfil",
     "utm_content": "threads_perfil_01",
     "access": "Enlace web",
     "detail": "Fuente threads para este enlace."
    },
    {
     "id": "x_threads_post",
     "label": "Threads / publicación o respuesta",
     "utm_source": "threads",
     "utm_medium": "social",
     "placement": "threads_post",
     "utm_content": "threads_post_01",
     "access": "Enlace web",
     "detail": "Fuente threads para este enlace."
    }
   ]
  },
  {
   "name": "Email / SMS",
   "source": "newsletter",
   "medium": "email",
   "note": "La fuente identifica el remitente o la lista. El contenido identifica la ubicación y pieza.",
   "presets": [
    {
     "id": "newsletter_boton",
     "label": "Newsletter / botón principal",
     "utm_source": "newsletter",
     "utm_medium": "email",
     "placement": "boton",
     "utm_content": "boton_01",
     "access": "Enlace web",
     "detail": "Fuente newsletter."
    },
    {
     "id": "newsletter_texto",
     "label": "Newsletter / enlace en el texto",
     "utm_source": "newsletter",
     "utm_medium": "email",
     "placement": "texto",
     "utm_content": "texto_01",
     "access": "Enlace web",
     "detail": "Distinguirlo del botón de la misma pieza."
    },
    {
     "id": "newsletter_secuencia",
     "label": "Secuencia automatizada",
     "utm_source": "automatizacion_email",
     "utm_medium": "email",
     "placement": "secuencia",
     "utm_content": "secuencia_01",
     "access": "Enlace web",
     "detail": "Fuente automatizacion_email."
    },
    {
     "id": "newsletter_firma",
     "label": "Correo comercial / firma",
     "utm_source": "equipo_comercial",
     "utm_medium": "email",
     "placement": "firma",
     "utm_content": "firma_01",
     "access": "Enlace web",
     "detail": "Fuente equipo_comercial."
    },
    {
     "id": "newsletter_sms",
     "label": "SMS / enlace",
     "utm_source": "sms",
     "utm_medium": "sms",
     "placement": "sms",
     "utm_content": "sms_01",
     "access": "Enlace web",
     "detail": "Fuente sms y medio sms."
    }
   ]
  },
  {
   "name": "Google / publicidad",
   "source": "google",
   "medium": "cpc",
   "note": "Se incluye publicidad y enlaces editables de la ficha del negocio. No añadir UTMs a resultados SEO o enlaces internos de tu web.",
   "presets": [
    {
     "id": "google_search_ad",
     "label": "Google Ads / búsqueda",
     "utm_source": "google",
     "utm_medium": "cpc",
     "placement": "search_ad",
     "utm_content": "search_ad_01",
     "access": "Condicionado",
     "detail": "Respetar autoetiquetado y parámetros de Google Ads."
    },
    {
     "id": "google_display_ad",
     "label": "Google Ads / display",
     "utm_source": "google",
     "utm_medium": "display",
     "placement": "display_ad",
     "utm_content": "display_ad_01",
     "access": "Condicionado",
     "detail": "Validar URL final y configuración de medición."
    },
    {
     "id": "google_business_web",
     "label": "Perfil de Empresa / sitio web",
     "utm_source": "google",
     "utm_medium": "referral",
     "placement": "business_web",
     "utm_content": "business_web_01",
     "access": "Condicionado",
     "detail": "URL editable de tu ficha verificada."
    },
    {
     "id": "google_business_post",
     "label": "Perfil de Empresa / publicación",
     "utm_source": "google",
     "utm_medium": "referral",
     "placement": "business_post",
     "utm_content": "business_post_01",
     "access": "Condicionado",
     "detail": "Botón web disponible en la ficha."
    },
    {
     "id": "google_bing_ad",
     "label": "Bing Ads / búsqueda",
     "utm_source": "bing",
     "utm_medium": "cpc",
     "placement": "bing_ad",
     "utm_content": "bing_ad_01",
     "access": "Condicionado",
     "detail": "Fuente bing. Respetar sus parámetros de medición."
    }
   ]
  },
  {
   "name": "QR / material offline",
   "source": "offline",
   "medium": "qr",
   "note": "El código QR contiene la URL etiquetada. La app de UTMs solo necesita generarla. Distinguir dónde se muestra el QR.",
   "presets": [
    {
     "id": "offline_tarjeta",
     "label": "Tarjeta de presentación",
     "utm_source": "tarjeta",
     "utm_medium": "qr",
     "placement": "tarjeta",
     "utm_content": "tarjeta_01",
     "access": "Enlace web",
     "detail": "Fuente tarjeta."
    },
    {
     "id": "offline_volante",
     "label": "Volante",
     "utm_source": "volante",
     "utm_medium": "qr",
     "placement": "volante",
     "utm_content": "volante_01",
     "access": "Enlace web",
     "detail": "Fuente volante."
    },
    {
     "id": "offline_cartel",
     "label": "Cartel / local",
     "utm_source": "local",
     "utm_medium": "qr",
     "placement": "cartel",
     "utm_content": "cartel_01",
     "access": "Enlace web",
     "detail": "Fuente local."
    },
    {
     "id": "offline_evento",
     "label": "Evento / diapositiva",
     "utm_source": "evento",
     "utm_medium": "qr",
     "placement": "evento",
     "utm_content": "evento_01",
     "access": "Enlace web",
     "detail": "Fuente evento."
    },
    {
     "id": "offline_packaging",
     "label": "Packaging / inserto",
     "utm_source": "packaging",
     "utm_medium": "qr",
     "placement": "packaging",
     "utm_content": "packaging_01",
     "access": "Enlace web",
     "detail": "Fuente packaging."
    }
   ]
  },
  {
   "name": "Aliados / otros",
   "source": "partner",
   "medium": "referral",
   "note": "Crear plantillas personalizadas permite cubrir nuevas redes y ubicaciones. Los valores son una convención del negocio, no una lista universal de las plataformas.",
   "presets": [
    {
     "id": "partner_referido",
     "label": "Aliado / enlace recomendado",
     "utm_source": "partner",
     "utm_medium": "referral",
     "placement": "referido",
     "utm_content": "referido_01",
     "access": "Enlace web",
     "detail": "Sustituir partner por el identificador estable del aliado."
    },
    {
     "id": "partner_podcast",
     "label": "Podcast / notas del episodio",
     "utm_source": "podcast",
     "utm_medium": "referral",
     "placement": "podcast",
     "utm_content": "podcast_01",
     "access": "Enlace web",
     "detail": "Fuente podcast o identificador del programa."
    },
    {
     "id": "partner_pdf",
     "label": "Documento descargable / enlace",
     "utm_source": "recurso_pdf",
     "utm_medium": "referral",
     "placement": "pdf",
     "utm_content": "pdf_01",
     "access": "Enlace web",
     "detail": "Fuente recurso_pdf. Conservar la atribución original si es parte del mismo recorrido."
    },
    {
     "id": "partner_personalizado",
     "label": "Otro canal / ubicación",
     "utm_source": "partner",
     "utm_medium": "referral",
     "placement": "personalizado",
     "utm_content": "personalizado_01",
     "access": "Condicionado",
     "detail": "Fuente, medio y ubicación editables. Registrar dónde se comparte realmente."
    }
   ]
  }
 ],
 "ctas": [
  {
   "id": "registrarse",
   "label": "Registrarse al webinar"
  },
  {
   "id": "reservar",
   "label": "Reservar una llamada"
  },
  {
   "id": "comprar",
   "label": "Comprar"
  },
  {
   "id": "cotizar",
   "label": "Solicitar cotización"
  },
  {
   "id": "descargar",
   "label": "Descargar un recurso"
  },
  {
   "id": "whatsapp",
   "label": "Abrir WhatsApp"
  },
  {
   "id": "grupo",
   "label": "Unirse a un grupo"
  },
  {
   "id": "suscribirse",
   "label": "Suscribirse a la newsletter"
  },
  {
   "id": "ver",
   "label": "Ver un vídeo u oferta"
  },
  {
   "id": "prueba",
   "label": "Solicitar una prueba"
  },
  {
   "id": "contactar",
   "label": "Contactar"
  },
  {
   "id": "otro",
   "label": "Otro CTA"
  }
 ],
 "sources": [
  {
   "title": "YouTube: enlaces disponibles",
   "url": "https://support.google.com/youtube/answer/13748639?hl=es"
  },
  {
   "title": "YouTube: pantallas finales",
   "url": "https://support.google.com/youtube/answer/6388789?hl=es"
  },
  {
   "title": "YouTube: tarjetas",
   "url": "https://support.google.com/youtube/answer/6140493?hl=es"
  },
  {
   "title": "TikTok: Destination Links",
   "url": "https://ads.tiktok.com/help/article/about-destination-links?lang=en"
  },
  {
   "title": "TikTok: Promote",
   "url": "https://ads.tiktok.com/resources/help/article/how-to-set-up-promote-for-website-visits-and-conversions?lang=en-GB"
  },
  {
   "title": "Instagram: enlaces en stories",
   "url": "https://about.fb.com/ja/news/2021/10/linkaccessstickers/"
  },
  {
   "title": "Google: parámetros UTM",
   "url": "https://support.google.com/analytics/answer/10917952?hl=es"
  }
 ]
};
