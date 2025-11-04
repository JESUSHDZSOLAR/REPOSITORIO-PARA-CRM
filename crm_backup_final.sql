--
-- PostgreSQL database dump
--

\restrict 2Npzr2E15nauOpR2tKbL4CAzRRHwCY7XkI5dxU6KQK6f9JWrhytzbSsUTqWmfsj

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asesores; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.asesores (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    telefono character varying(20),
    fecha_ingreso date NOT NULL
);


ALTER TABLE public.asesores OWNER TO crm_user;

--
-- Name: asesores_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.asesores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asesores_id_seq OWNER TO crm_user;

--
-- Name: asesores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.asesores_id_seq OWNED BY public.asesores.id;


--
-- Name: auditoria_accesos; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.auditoria_accesos (
    id integer NOT NULL,
    usuario_id integer,
    fecha_acceso timestamp without time zone DEFAULT now(),
    metodo character varying(50),
    estado character varying(50)
);


ALTER TABLE public.auditoria_accesos OWNER TO crm_user;

--
-- Name: auditoria_accesos_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.auditoria_accesos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_accesos_id_seq OWNER TO crm_user;

--
-- Name: auditoria_accesos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.auditoria_accesos_id_seq OWNED BY public.auditoria_accesos.id;


--
-- Name: auditoria_clientes; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.auditoria_clientes (
    id integer NOT NULL,
    cliente_id integer,
    usuario_id integer,
    accion character varying(20) NOT NULL,
    campos_cambiados jsonb,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(45),
    user_agent text
);


ALTER TABLE public.auditoria_clientes OWNER TO crm_user;

--
-- Name: auditoria_clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.auditoria_clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_clientes_id_seq OWNER TO crm_user;

--
-- Name: auditoria_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.auditoria_clientes_id_seq OWNED BY public.auditoria_clientes.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    empresa character varying(100),
    telefono character varying(20),
    celular character varying(20) NOT NULL,
    correo character varying(100) NOT NULL,
    asesor_id integer,
    domicilio text,
    descripcion_proyecto text,
    tipo_sistema character varying(50),
    tipo_proyecto character varying(50),
    ubicacion text,
    tarifa_cfe character varying(20),
    cedis character varying(50),
    razon_social character varying(150),
    consumo_promedio numeric,
    porcentaje_ahorro numeric,
    ahorro_anual numeric,
    documento_cfe character varying(255),
    link_cfe character varying(255),
    status character varying(20) DEFAULT 'pendiente'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    imgbb_url text,
    documento_subido character varying(10) DEFAULT 'no'::character varying
);


ALTER TABLE public.clientes OWNER TO crm_user;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO crm_user;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: interacciones; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.interacciones (
    id integer NOT NULL,
    cliente_id integer,
    tipo character varying(50) NOT NULL,
    fecha timestamp without time zone NOT NULL,
    notas text,
    resultado character varying(50)
);


ALTER TABLE public.interacciones OWNER TO crm_user;

--
-- Name: interacciones_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.interacciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interacciones_id_seq OWNER TO crm_user;

--
-- Name: interacciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.interacciones_id_seq OWNED BY public.interacciones.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(200) NOT NULL,
    role character varying(20) NOT NULL,
    rfid_uid character varying(50),
    CONSTRAINT usuarios_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'asesor'::character varying, 'restricted'::character varying])::text[]))),
    CONSTRAINT valid_roles CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'asesor'::character varying, 'restricted'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO crm_user;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO crm_user;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: asesores id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.asesores ALTER COLUMN id SET DEFAULT nextval('public.asesores_id_seq'::regclass);


--
-- Name: auditoria_accesos id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_accesos ALTER COLUMN id SET DEFAULT nextval('public.auditoria_accesos_id_seq'::regclass);


--
-- Name: auditoria_clientes id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_clientes ALTER COLUMN id SET DEFAULT nextval('public.auditoria_clientes_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: interacciones id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interacciones ALTER COLUMN id SET DEFAULT nextval('public.interacciones_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: asesores; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.asesores (id, nombre, correo, telefono, fecha_ingreso) FROM stdin;
103	asesor4	asesor4@gmail.com	1234567989	2025-09-24
105	asesor5	asesor5@gmail.com	1234567890	2025-10-01
12	YULIANA	yuliana@gmmail.com	1234567890	2025-09-11
2	NESTOR FLORES	nestor.flores@solarever.com.mx	+52 56 4184 8434	2025-10-15
109	AESOR3	asesor3@gmail.com	1234567890	2025-10-14
123	ROCIOS	rocios@gmail.com	1234567890	2025-10-28
115	AESOR8	asesor8@gmail.com	1234567890	2025-10-28
112	asesor7	asesor7@gmail.com	5515908902	2025-10-28
17	asesor2	asesor2@gmail.com	4321567890	2025-10-28
\.


--
-- Data for Name: auditoria_accesos; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.auditoria_accesos (id, usuario_id, fecha_acceso, metodo, estado) FROM stdin;
1	4	2025-10-15 12:20:14.053765	RFID	permitido
2	4	2025-10-15 12:20:24.228858	RFID	permitido
3	\N	2025-10-15 12:20:45.695006	RFID	denegado
4	4	2025-10-15 12:21:01.217108	RFID	permitido
5	4	2025-10-15 12:32:02.703425	RFID	permitido
6	4	2025-10-15 12:33:44.667665	RFID	permitido
7	4	2025-10-15 12:34:09.15932	RFID	permitido
8	4	2025-10-15 12:51:29.786223	RFID	permitido
9	4	2025-10-15 13:35:01.890832	RFID	permitido
10	4	2025-10-15 13:38:48.781201	RFID	permitido
11	\N	2025-10-15 13:39:26.005468	RFID	denegado
12	4	2025-10-21 08:28:01.969879	RFID	permitido
13	4	2025-10-21 08:28:18.143589	RFID	permitido
14	4	2025-10-21 08:28:27.976521	RFID	permitido
15	4	2025-10-21 09:00:25.785528	RFID	permitido
16	\N	2025-10-21 09:02:13.744989	RFID	denegado
17	4	2025-10-21 09:02:51.434468	RFID	permitido
18	4	2025-10-21 09:03:09.042238	RFID	permitido
19	4	2025-10-21 10:08:16.176389	RFID	permitido
20	4	2025-10-21 10:08:30.031616	RFID	permitido
21	4	2025-10-21 10:24:06.230019	RFID	permitido
22	\N	2025-10-21 10:24:47.819891	RFID	denegado
23	4	2025-10-21 10:25:06.263869	RFID	permitido
24	4	2025-10-21 10:25:32.902897	RFID	permitido
25	4	2025-10-21 10:27:44.15817	RFID	permitido
26	4	2025-10-21 10:29:03.116188	RFID	permitido
27	4	2025-10-21 10:29:34.57458	RFID	permitido
28	4	2025-10-21 10:29:44.586896	RFID	permitido
29	4	2025-10-21 10:32:26.143272	RFID	permitido
30	4	2025-10-21 10:32:38.051264	RFID	permitido
31	4	2025-10-21 10:32:45.88028	RFID	permitido
32	4	2025-10-21 10:32:53.016176	RFID	permitido
33	4	2025-10-21 10:57:09.033449	RFID	permitido
34	4	2025-10-21 10:57:41.998569	RFID	permitido
35	4	2025-10-21 10:58:39.548683	RFID	permitido
36	4	2025-10-21 11:13:08.900871	RFID	permitido
37	4	2025-10-21 11:56:21.030798	RFID	permitido
38	4	2025-10-21 11:56:40.323147	RFID	permitido
39	4	2025-10-21 11:58:49.975824	RFID	permitido
40	4	2025-10-21 11:59:25.617585	RFID	permitido
41	4	2025-10-21 13:21:05.852824	RFID	permitido
42	4	2025-10-21 13:21:21.771377	RFID	permitido
43	4	2025-10-21 13:21:28.022008	RFID	permitido
44	4	2025-10-21 13:26:30.195303	RFID	permitido
45	4	2025-10-21 13:27:01.73936	RFID	permitido
46	4	2025-10-21 13:34:43.582945	RFID	permitido
47	\N	2025-10-21 13:35:40.392702	RFID	denegado
48	4	2025-10-21 13:35:57.997347	RFID	permitido
49	\N	2025-10-21 13:36:12.551925	RFID	denegado
50	4	2025-10-21 14:01:58.302786	RFID	permitido
51	4	2025-10-21 14:13:25.810206	RFID	permitido
52	4	2025-10-22 10:30:58.921184	RFID	permitido
53	\N	2025-10-22 10:37:23.812107	RFID	denegado
54	4	2025-10-22 10:37:29.349095	RFID	permitido
55	\N	2025-10-22 11:10:49.364158	RFID	denegado
56	4	2025-10-22 11:10:59.873494	RFID	permitido
57	\N	2025-10-22 11:11:28.73093	RFID	denegado
58	4	2025-10-22 11:11:33.535745	RFID	permitido
59	\N	2025-10-22 11:19:41.083087	RFID	denegado
60	4	2025-10-22 11:22:14.698057	RFID	permitido
61	\N	2025-10-22 11:22:50.89916	RFID	denegado
62	4	2025-10-22 11:22:56.655575	RFID	permitido
63	\N	2025-10-22 11:24:36.845485	RFID	denegado
64	4	2025-10-22 11:24:55.677269	RFID	permitido
65	\N	2025-10-22 11:25:03.006327	RFID	denegado
66	4	2025-10-22 11:25:09.34344	RFID	permitido
67	\N	2025-10-22 11:25:21.83189	RFID	denegado
68	4	2025-10-22 11:25:29.646349	RFID	permitido
69	4	2025-10-22 11:56:15.828672	RFID	permitido
70	\N	2025-10-22 11:57:35.712513	RFID	denegado
71	4	2025-10-22 11:57:42.040004	RFID	permitido
72	4	2025-10-22 12:56:49.154232	RFID	permitido
73	4	2025-10-22 12:58:03.829408	RFID	permitido
74	4	2025-10-22 12:58:13.195256	RFID	permitido
75	\N	2025-10-22 12:58:30.491587	RFID	denegado
76	4	2025-10-22 12:58:54.649328	RFID	permitido
77	4	2025-10-22 12:59:15.312275	RFID	permitido
78	\N	2025-10-22 12:59:54.798944	RFID	denegado
79	\N	2025-10-22 14:01:33.714693	RFID	denegado
80	4	2025-10-22 14:01:38.394568	RFID	permitido
81	4	2025-10-22 14:02:19.179386	RFID	permitido
82	4	2025-10-23 08:05:23.320589	RFID	permitido
83	4	2025-10-23 08:05:54.382276	RFID	permitido
84	4	2025-10-23 08:05:59.655997	RFID	permitido
85	4	2025-10-23 08:06:18.900271	RFID	permitido
86	4	2025-10-23 08:06:30.011166	RFID	permitido
87	\N	2025-10-23 08:06:41.456859	RFID	denegado
88	4	2025-10-23 08:17:54.44853	RFID	permitido
89	4	2025-10-23 08:19:42.17013	RFID	permitido
90	4	2025-10-23 08:25:52.655199	RFID	permitido
91	4	2025-10-23 08:30:32.958572	RFID	permitido
92	4	2025-10-23 08:30:59.533478	RFID	permitido
93	4	2025-10-23 08:31:21.930109	RFID	permitido
94	4	2025-10-23 08:31:34.42028	RFID	permitido
95	4	2025-10-23 10:37:37.892084	RFID	permitido
96	\N	2025-10-23 10:39:13.737213	RFID	denegado
97	4	2025-10-30 12:20:35.68452	RFID	permitido
98	4	2025-10-30 12:20:42.547329	RFID	permitido
99	4	2025-10-30 12:20:57.300104	RFID	permitido
100	4	2025-10-30 12:21:05.165284	RFID	permitido
101	4	2025-10-30 12:21:41.892962	RFID	permitido
102	4	2025-10-30 12:22:32.861509	RFID	permitido
103	4	2025-10-30 12:22:41.784392	RFID	permitido
104	\N	2025-10-30 12:23:03.886133	RFID	denegado
105	\N	2025-10-30 12:23:19.874749	RFID	denegado
106	4	2025-10-30 12:23:28.345836	RFID	permitido
107	4	2025-10-30 12:27:07.98069	RFID	permitido
108	\N	2025-10-30 12:27:18.024639	RFID	denegado
109	\N	2025-10-30 12:27:28.494194	RFID	denegado
110	4	2025-10-30 12:27:35.034815	RFID	permitido
111	4	2025-10-30 12:28:41.585934	RFID	permitido
112	4	2025-10-30 12:34:52.759846	RFID	permitido
113	4	2025-10-30 12:35:00.271282	RFID	permitido
114	\N	2025-10-30 12:35:07.695185	RFID	denegado
115	4	2025-10-30 12:35:15.616314	RFID	permitido
116	\N	2025-10-30 12:35:24.610299	RFID	denegado
117	4	2025-10-30 12:35:36.512245	RFID	permitido
118	\N	2025-10-30 12:43:25.997986	RFID	denegado
119	4	2025-10-30 12:43:34.496968	RFID	permitido
120	4	2025-10-30 12:53:26.767029	RFID	permitido
121	4	2025-10-30 12:54:26.210812	RFID	permitido
122	4	2025-10-30 12:55:24.685269	RFID	permitido
123	\N	2025-10-30 12:57:30.580523	RFID	denegado
124	4	2025-10-30 12:57:47.176046	RFID	permitido
125	\N	2025-10-30 13:11:34.45449	RFID	denegado
126	\N	2025-10-30 13:11:44.496432	RFID	denegado
127	4	2025-10-30 13:11:54.209809	RFID	permitido
128	\N	2025-10-30 13:12:01.169872	RFID	denegado
129	\N	2025-10-30 13:12:37.643561	RFID	denegado
130	4	2025-10-30 13:12:41.34391	RFID	permitido
131	\N	2025-10-30 13:12:49.508144	RFID	denegado
132	\N	2025-10-30 13:13:14.091732	RFID	denegado
133	\N	2025-10-30 13:15:32.778329	RFID	denegado
134	4	2025-10-30 13:15:36.863437	RFID	permitido
135	\N	2025-10-30 13:20:01.946761	RFID	denegado
136	4	2025-10-30 13:20:11.485875	RFID	permitido
137	\N	2025-10-30 13:20:20.384419	RFID	denegado
138	4	2025-10-30 13:20:38.6066	RFID	permitido
139	\N	2025-10-30 13:20:56.633164	RFID	denegado
140	\N	2025-10-30 13:21:01.745233	RFID	denegado
141	4	2025-10-30 13:22:34.716943	RFID	permitido
142	4	2025-10-30 13:25:09.149983	RFID	permitido
143	\N	2025-10-30 13:26:47.071652	RFID	denegado
144	4	2025-10-30 13:26:58.123313	RFID	permitido
\.


--
-- Data for Name: auditoria_clientes; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.auditoria_clientes (id, cliente_id, usuario_id, accion, campos_cambiados, fecha, ip_address, user_agent) FROM stdin;
1	10	1	actualizar	{"nombre": {"nuevo": "GERARDO ESPINOZA (modificado)", "anterior": "GERARDO ESPINOZA"}, "status": {"nuevo": "contactado", "anterior": "pendiente"}}	2025-10-08 11:38:53.665704	192.168.1.100	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
4	5	1	actualizar	{"nombre": {"nuevo": "Ricardo (modificado)", "anterior": "Ricardo"}, "status": {"nuevo": "contactado", "anterior": "pendiente"}}	2025-10-08 11:38:53.665704	192.168.1.100	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
5	7	1	actualizar	{"nombre": {"nuevo": "Alejandro Torres (modificado)", "anterior": "Alejandro Torres"}, "status": {"nuevo": "contactado", "anterior": "pendiente"}}	2025-10-08 11:38:53.665704	192.168.1.100	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
6	10	8	actualizar	{"nombre": {"nuevo": "GERARDO ESPINOZA MARTINEZ.", "anterior": "GERARDO ESPINOZA MTZ."}, "asesor_id": {"nuevo": 17, "anterior": 109}, "consumo_promedio": {"nuevo": 42000000, "anterior": "42000000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-08 12:54:19.936067	::1	\N
8	5	8	actualizar	{"consumo_promedio": {"nuevo": 30000, "anterior": "30000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-08 13:28:50.868533	127.0.0.1	CRM-Solarever-WebApp
9	5	8	actualizar	{"nombre": {"nuevo": "Ricardo Sola", "anterior": "Ricardo"}, "consumo_promedio": {"nuevo": 30000, "anterior": "30000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-08 13:29:02.332171	127.0.0.1	CRM-Solarever-WebApp
10	5	8	actualizar	{"nombre": {"nuevo": "Ricardo ESS", "anterior": "Ricardo Sola"}, "consumo_promedio": {"nuevo": 30000, "anterior": "30000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-08 13:29:21.148239	127.0.0.1	CRM-Solarever-WebApp
19	14	4	actualizar	{"asesor_id": {"nuevo": 109, "anterior": null}, "consumo_promedio": {"nuevo": 1200, "anterior": "1200"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-09 13:50:19.430232	127.0.0.1	CRM-Solarever-WebApp
20	14	4	actualizar	{"consumo_promedio": {"nuevo": 1200, "anterior": "1200"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-14 08:54:02.907433	127.0.0.1	CRM-Solarever-WebApp
21	14	4	actualizar	{"tipo_sistema": {"nuevo": "fotovoltaico, almacenamiento", "anterior": ""}, "consumo_promedio": {"nuevo": 1200, "anterior": "1200"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-14 08:54:29.035625	127.0.0.1	CRM-Solarever-WebApp
22	14	4	actualizar	{"status": {"nuevo": "vendido", "anterior": "pendiente"}, "consumo_promedio": {"nuevo": 1200, "anterior": "1200"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-14 08:54:42.584377	127.0.0.1	CRM-Solarever-WebApp
23	18	4	actualizar	{"link_cfe": {"nuevo": "https://drive.google.com/file/d/1XPTO-Ev1rIJVJIkfTHc9qz2Q6i3xTLrJ/view?usp=drive_link", "anterior": null}, "consumo_promedio": {"nuevo": 2333, "anterior": "2333"}, "porcentaje_ahorro": {"nuevo": 34, "anterior": "34"}}	2025-10-14 10:39:40.140245	127.0.0.1	CRM-Solarever-WebApp
24	18	4	actualizar	{"status": {"nuevo": "contactado", "anterior": "pendiente"}, "consumo_promedio": {"nuevo": 2333, "anterior": "2333"}, "porcentaje_ahorro": {"nuevo": 34, "anterior": "34"}}	2025-10-14 10:39:49.788121	127.0.0.1	CRM-Solarever-WebApp
28	16	4	actualizar	{"asesor_id": {"nuevo": 12, "anterior": null}, "consumo_promedio": {"nuevo": 1500, "anterior": "1500"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-21 13:27:17.543542	127.0.0.1	CRM-Solarever-WebApp
39	30	4	actualizar	{"cedis": {"nuevo": "Chihuahua", "anterior": ""}, "ubicacion": {"nuevo": "https://www.google.com/maps/place/Guanajuato/@20.8735908,-102.2040373,8z/data=!3m1!4b1!4m6!3m5!1s0x842b5b8f509b7f7f:0xe78ea61981be43a0!8m2!3d20.9170187!4d-101.1617356!16zL20vMDI1OXdz?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D", "anterior": ""}, "razon_social": {"nuevo": "ss", "anterior": ""}, "tipo_sistema": {"nuevo": "fotovoltaico, almacenamiento", "anterior": ""}, "tipo_proyecto": {"nuevo": "aislado", "anterior": null}, "consumo_promedio": {"nuevo": 444, "anterior": "0"}, "porcentaje_ahorro": {"nuevo": 98, "anterior": "0"}, "descripcion_proyecto": {"nuevo": "union", "anterior": ""}}	2025-10-30 11:08:27.940007	127.0.0.1	CRM-Solarever-WebApp
40	30	4	actualizar	{"consumo_promedio": {"nuevo": 444, "anterior": "444"}, "porcentaje_ahorro": {"nuevo": 98, "anterior": "98"}}	2025-10-30 11:08:28.009862	127.0.0.1	CRM-Solarever-WebApp
41	30	4	actualizar	{"status": {"nuevo": "vendido", "anterior": "pendiente"}}	2025-10-30 11:08:45.72158	127.0.0.1	CRM-Solarever-WebApp
42	5	4	actualizar	{"nombre": {"nuevo": "Ricardo BESS", "anterior": "Ricardo ESS"}, "consumo_promedio": {"nuevo": 30000, "anterior": "30000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-30 11:38:15.110749	127.0.0.1	CRM-Solarever-WebApp
43	5	4	actualizar	{"consumo_promedio": {"nuevo": 30000, "anterior": "30000"}, "porcentaje_ahorro": {"nuevo": 75, "anterior": "75"}}	2025-10-30 11:38:15.192392	127.0.0.1	CRM-Solarever-WebApp
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.clientes (id, nombre, empresa, telefono, celular, correo, asesor_id, domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion, tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro, ahorro_anual, documento_cfe, link_cfe, status, fecha_creacion, fecha_actualizacion, imgbb_url, documento_subido) FROM stdin;
30	CRISTIAN RAMIREZ CORTES	ss	5515908902	6296789476	ZARAZUA@GMAIL.COM	2		union	fotovoltaico, almacenamiento	aislado	https://www.google.com/maps/place/Guanajuato/@20.8735908,-102.2040373,8z/data=!3m1!4b1!4m6!3m5!1s0x842b5b8f509b7f7f:0xe78ea61981be43a0!8m2!3d20.9170187!4d-101.1617356!16zL20vMDI1OXdz?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D		Chihuahua	ss	444	98	\N	\N	\N	vendido	2025-10-30 11:07:14.048456	2025-10-30 11:08:45.718594	https://i.ibb.co/pBj5tsSP/recibo-de-luz-domestico-cfe-ejemplo.jpg	si
18	JUAN XOFF	LALA	1234567890	9264436802	JUANXOFF@gmail.com	105	D	D	fotovoltaico, almacenamiento	interconectado	https://www.google.com/maps/place/Guanajuato/@20.8735908,-102.2040373,8z/data=!3m1!4b1!4m6!3m5!1s0x842b5b8f509b7f7f:0xe78ea61981be43a0!8m2!3d20.9170187!4d-101.1617356!16zL20vMDI1OXdz?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D	GDMTO	Chihuahua	ESS S.A. de C.V	2333	34	\N	\N	https://drive.google.com/file/d/1XPTO-Ev1rIJVJIkfTHc9qz2Q6i3xTLrJ/view?usp=drive_link	contactado	2025-10-14 10:07:15.281008	2025-10-14 10:39:49.773927	\N	no
7	Alejandro Torres	TECNM	5541333401	5561238904	alejandro@gmail.com	2	Estanislao Ramirez Ruiz col Selene Tlahuac CDMX	INVERSORES	fotovoltaico	interconectado		GDMTO	Mérida	TECNM CAMPUS TLAHUAC 1	3300	75	\N	\N	\N	no-contesto	2025-09-24 12:30:47.460122	2025-10-08 11:46:13.583733	\N	no
10	GERARDO ESPINOZA MARTINEZ.	SAM´S CLUB	5541339908	5567845920	GERARDOep@gmail.com	17	San pedro de los Garza, Monterrey, Mexico	sistema de 42 MWh	almacenamiento	aislado	https://www.google.com.mx/maps/place/Sam's+Club+Polanco/@19.4388988,-99.2646456,13z/data=!3m1!5s0x85d20207005f0659:0x200572474fdd4905!4m10!1m2!2m1!1ssams!3m6!1s0x85d2020701891083:0x4741e17e84fdca06!8m2!3d19.4388988!4d-99.1925478!15sCgRzYW1zIgOIAQFaBiIEc2Ftc5IBDndhcmVob3VzZV9jbHViqgFQCg0vZy8xMWJ3MjFsNzY5CgkvbS8wMndxc2wQASoIIgRzYW1zKA4yHhABIhpef60PL_IKKMbve2zp-w-ANO7S8xdap5CmKzIIEAIiBHNhbXPgAQA!16s%2Fg%2F11c43mcvx7?entry=ttu&g_ep=EgoyMDI1MDkyOC4wIKXMDSoASAFQAw%3D%3D		Guadalajara	SAM´S CLUB S.A. DE C.V.	42000000	75	\N	\N	\N	vendido	2025-10-01 13:06:49.056016	2025-10-08 12:54:19.932238	\N	no
14	OSCAR	CIRCLE K	1234567890	6296789476	CIRCLEK@gmail.com	109	LAS TORRES	FOTOVOLTAICO	fotovoltaico, almacenamiento	hibrido	https://www.google.com/maps/place/Circle+K+Plaza+Polanco/@19.4372313,-99.2466332,14z/data=!4m10!1m2!2m1!1sCircle+K!3m6!1s0x85d20218eb9bd47f:0x9e60ed16c642c652!8m2!3d19.4372313!4d-99.2105843!15sCghDaXJjbGUgSyIDiAEBWgoiCGNpcmNsZSBrkgERY29udmVuaWVuY2Vfc3RvcmWaASRDaGREU1VoTk1HOW5TMFZKUTBGblNVUkNlalJUZG5wUlJSQUKqAVgKDS9nLzExYzU5bl9xbnMKCS9tLzAxeHo5dhABKgwiCGNpcmNsZSBrKA4yHhABIhpSMSv5n4UyDnYwiflA0VfOvnz7-8FmxXlRTjIMEAIiCGNpcmNsZSBr4AEA-gEECAAQEw!16s%2Fg%2F11dxbv5d7k?entry=ttu&g_ep=EgoyMDI1MTAwNy4wIKXMDSoASAFQAw%3D%3D	DIST	Monterrey	circlek s.a de c.v	1200	75	\N	\N	\N	vendido	2025-10-09 12:56:51.674019	2025-10-14 08:54:42.531427	\N	no
16	JESSICA	DELL	5567853423	9264436802	JESSICA@GMAIL.COM	12	LAS TORRES	UNIDAD FOTOVOLTAICA	fotovoltaico, almacenamiento	aislado	https://www.google.com/maps/place/Guanajuato/@20.8735908,-102.2040373,8z/data=!3m1!4b1!4m6!3m5!1s0x842b5b8f509b7f7f:0xe78ea61981be43a0!8m2!3d20.9170187!4d-101.1617356!16zL20vMDI1OXdz?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D	GDMTO	Monterrey	ESS S.A. de C.V	1500	75	\N	\N	\N	pendiente	2025-10-14 09:01:01.07747	2025-10-21 13:27:17.455478	\N	no
31	JESUS HERNANDEZ CASTILLO	TELMEX	1234567890	0987654321	castillo.03jesus@gmail.com	12	SAN JUAN 12, BARRIO SAN JUAN, ALCALDIA TLAHUAC, C.P. 13030, CDMX	BESS RESIDENTIAL SOLAREVER	fotovoltaico, almacenamiento	interconectado	TELMEX S.A. de C.V.	PDBT	León	TELMEX S.A. de C.V.	1500	78	\N	\N	\N	pendiente	2025-10-30 11:35:40.809749	2025-10-30 11:35:40.809749	https://i.ibb.co/pvc0KNnM/RECIBO-CFEEJ2.webp	si
5	Ricardo BESS	soriana	1234567980	09876543211	ricardo@gmail.com	2	av. Torres	consume 30, 000 kwh al mes con una demanda de 50 kwh. Buscar una solución solar con baterias	almacenamiento	hibrido	https://www.google.com.mx/maps/place/Sam's+Club+Polanco/@19.4388988,-99.2646456,13z/data=!3m1!5s0x85d20207005f0659:0x200572474fdd4905!4m10!1m2!2m1!1ssams!3m6!1s0x85d2020701891083:0x4741e17e84fdca06!8m2!3d19.4388988!4d-99.1925478!15sCgRzYW1zIgOIAQFaBiIEc2Ftc5IBDndhcmVob3VzZV9jbHViqgFQCg0vZy8xMWJ3MjFsNzY5CgkvbS8wMndxc2wQASoIIgRzYW1zKA4yHhABIhpef60PL_IKKMbve2zp-w-ANO7S8xdap5CmKzIIEAIiBHNhbXPgAQA!16s%2Fg%2F11c43mcvx7?entry=ttu&g_ep=EgoyMDI1MDkyOC4wIKXMDSoASAFQAw%3D%3D	GDMTH	Monterrey	SORIANA S.A DE C.V.	30000	75	\N	\N	\N	vendido	2025-09-23 10:53:00.137962	2025-10-30 11:38:15.17828	\N	no
\.


--
-- Data for Name: interacciones; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.interacciones (id, cliente_id, tipo, fecha, notas, resultado) FROM stdin;
4	5	llamada	2025-09-23 18:38:00	se interesa por un inversor fv	contactado
5	5	reunion	2025-09-23 18:38:00	lo rechazó	no-contesto
7	5	llamada	2025-09-23 13:42:00	se logró!\n	vendido
9	5	llamada	2025-09-23 13:51:00	.-	vendido
14	7	llamada	2025-09-25 18:45:00	x	\N
15	7	llamada	2025-09-25 18:45:00	x	
16	7	correo	2025-09-25 18:47:00	d	vendido
17	7	correo	2025-09-25 18:47:00	d	vendido
19	5	cotizacion	2025-09-30 17:08:00	se arrepintió	no-contesto
20	5	llamada	2025-09-30 17:37:00	dijo que si\n	vendido
23	7	llamada	2025-10-01 16:51:00	N	no-contesto
24	7	llamada	2025-10-01 16:52:00	N	no-contesto
30	10	llamada	2025-09-01 19:07:00	se intereso	contactado
31	10	llamada	2025-07-09 19:12:00	CAMBIO DE OPINION	no-contesto
32	10	llamada	2025-10-01 19:15:00	SI LO QUIERE	vendido
35	10	reunion	2025-10-08 18:53:00	OTRO MAS	vendido
38	14	actualizacion	2025-10-14 14:54:00	Estado cambiado de "pendiente" a "vendido"	vendido
39	18	actualizacion	2025-10-14 16:39:00	Estado cambiado de "pendiente" a "contactado"	contactado
40	30	llamada	2025-10-30 17:08:00	j	vendido
41	30	llamada	2025-10-30 17:08:00	j	vendido
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.usuarios (id, username, password, role, rfid_uid) FROM stdin;
1	admin	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	admin	\N
4	ESS	$2b$10$5amZ6ZJ8p4MBrGXuZBO2MO9Ec5wo.mlkT4Du8sJujODj3ni7USn32	admin	8707B205
8	Acceso1	$2b$08$/4XhWC1XHzIwUxR5YYocm.AqtZpXBDwtY6TtrKtsnV6W.bE4ZS.Dq	restricted	\N
\.


--
-- Name: asesores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.asesores_id_seq', 128, true);


--
-- Name: auditoria_accesos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.auditoria_accesos_id_seq', 144, true);


--
-- Name: auditoria_clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.auditoria_clientes_id_seq', 43, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.clientes_id_seq', 31, true);


--
-- Name: interacciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.interacciones_id_seq', 41, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- Name: asesores asesores_correo_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.asesores
    ADD CONSTRAINT asesores_correo_key UNIQUE (correo);


--
-- Name: asesores asesores_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.asesores
    ADD CONSTRAINT asesores_pkey PRIMARY KEY (id);


--
-- Name: auditoria_accesos auditoria_accesos_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_accesos
    ADD CONSTRAINT auditoria_accesos_pkey PRIMARY KEY (id);


--
-- Name: auditoria_clientes auditoria_clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_clientes
    ADD CONSTRAINT auditoria_clientes_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_correo_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_correo_key UNIQUE (correo);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: interacciones interacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interacciones
    ADD CONSTRAINT interacciones_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_rfid_uid_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rfid_uid_key UNIQUE (rfid_uid);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: asesores_correo_unique_idx; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE UNIQUE INDEX asesores_correo_unique_idx ON public.asesores USING btree (lower(TRIM(BOTH FROM correo)));


--
-- Name: idx_auditoria_cliente_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_auditoria_cliente_id ON public.auditoria_clientes USING btree (cliente_id);


--
-- Name: idx_auditoria_fecha; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_auditoria_fecha ON public.auditoria_clientes USING btree (fecha);


--
-- Name: idx_auditoria_usuario_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_auditoria_usuario_id ON public.auditoria_clientes USING btree (usuario_id);


--
-- Name: auditoria_accesos auditoria_accesos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_accesos
    ADD CONSTRAINT auditoria_accesos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: auditoria_clientes auditoria_clientes_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_clientes
    ADD CONSTRAINT auditoria_clientes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: auditoria_clientes auditoria_clientes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.auditoria_clientes
    ADD CONSTRAINT auditoria_clientes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: clientes clientes_asesor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_asesor_id_fkey FOREIGN KEY (asesor_id) REFERENCES public.asesores(id) ON DELETE SET NULL;


--
-- Name: interacciones interacciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interacciones
    ADD CONSTRAINT interacciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO crm_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 2Npzr2E15nauOpR2tKbL4CAzRRHwCY7XkI5dxU6KQK6f9JWrhytzbSsUTqWmfsj

