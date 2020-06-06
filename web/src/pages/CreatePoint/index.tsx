import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./styles.css";
import Logo from "../../assets/logo.svg";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from "../../services/api";
import axios from "axios";
import Dropzone from "../../components";

interface Item {
  idItem: number;
  title: string;
  image: string;
}

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

interface IBGECityResponse {
  nome: string;
  id: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectItem, setSelectItem] = useState<number[]>([]);
  const [ufs, setUFs] = useState<IBGEUFResponse[]>([]);
  const [UF, setUF] = useState("0");
  const [cidades, setCidades] = useState<IBGECityResponse[]>([]);
  const [Cidade, setCidade] = useState("0");
  const [posinicial, setPosInicial] = useState<[number, number]>([
    -23.19,
    -46.89,
  ]);
  const [posicao, setPosicao] = useState<[number, number]>([-23.19, -46.89]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    zipzorp: "",
  });
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPosInicial([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then((res) => setItems(res.data));
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((res) => {
        const resufs = res.data.map((uf) => {
          const { sigla, nome } = uf;
          return { sigla, nome };
        });
        setUFs(resufs);
      });
  }, []);

  useEffect(() => {
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF}/municipios`
      )
      .then((res) => {
        const rescidades = res.data.map((cidade) => {
          const { nome, id } = cidade;
          return { nome, id };
        });
        setCidades(rescidades);
      });
  }, [UF]);

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    const selUF = event.target.value;
    setUF(selUF);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const selCidade = event.target.value;
    setCidade(selCidade);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setPosicao([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const selected = selectItem.findIndex((item) => item === id);

    selected >= 0
      ? setSelectItem(selectItem.filter((item) => item !== id))
      : setSelectItem([...selectItem, id]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, zipzorp } = formData;
    const estado = UF;
    const cidade = Cidade;
    const [latitude, longitude] = posicao;
    const items = selectItem;

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("zipzorp", zipzorp);
    data.append("estado", estado);
    data.append("cidade", cidade);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("items", items.join(","));
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("points", data);
    alert(`Ponto ${name} Cadastrado com Sucesso`);
    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Logo ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do Ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="zipzorp">Whatsapp</label>
              <input
                type="text"
                name="zipzorp"
                id="zipzorp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa </span>
          </legend>

          <Map center={posinicial} zoom={16} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={posicao} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="estado">Estado</label>
              <select
                name="estado"
                id="estado"
                value={UF}
                onChange={handleSelectUF}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <select
                name="cidade"
                id="cidade"
                value={Cidade}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span> Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.idItem}
                onClick={() => handleSelectItem(item.idItem)}
                className={selectItem.includes(item.idItem) ? "selected" : ""}
              >
                <img src={item.image} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  );
};
export default CreatePoint;
