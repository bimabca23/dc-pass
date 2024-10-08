import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import moment from "moment";
import "moment/locale/id";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import packageJson from "../package.json";
import "./styles.css";

interface PassMasuk {
  passId: string;
  requestor: string;
  purpose: string;
  workingTool: string;
  clockIn: string;
  clockOut: string;
  pic: string;
  vendor: string;
}

interface Asset {
  passId: string;
  requestor: string;
  purpose: string;
  location: string;
  ciName: string;
  ciStatus: string;
  tagNumber: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  room: string;
  rack: string;
}

interface NewPassMasuk {
  passId: string;
  requestor: string;
  purpose: string;
  workingTool: string;
  clockIn: string;
  clockOut: string;
  pic: string[];
  vendor: string[];
  isSelected: boolean;
}

interface NewAsset {
  passId: string;
  requestor: string;
  purpose: string;
  location: string;
  item: {
    ciName: string;
    ciStatus: string;
    tagNumber: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    room: string;
    rack: string;
  }[];
}

interface Penambahan {
  passId: string;
  workingTool: string;
  pic: string;
  vendor: string;
}

export default function App() {
  const [passIdList, setPassIdList] = useState<string[]>([]);
  const [newPassMasukData, setNewPassMasukData] = useState<NewPassMasuk[]>([]);
  const [newPassMasukFoc, setNewPassMasukFoc] = useState<NewPassMasuk[]>([]);
  const newPassMasukSelected: NewPassMasuk[] = newPassMasukData.filter(
    (dt) => dt.isSelected
  );
  const [newAssetData, setNewAssetData] = useState<NewAsset[]>([]);
  const [listPenambahan, setListPenambahan] = useState<Penambahan[]>([]);
  const [penambahan, setPenambahan] = useState<Penambahan>({
    passId: "",
    workingTool: "",
    pic: "",
    vendor: "",
  });

  useEffect(() => {
    if (newPassMasukData.length) {
      let passMasukFoc: NewPassMasuk[] = [];
      newPassMasukData.forEach((dt) => {
        if (
          [
            "NOVA BUDI KURNIAWAN",
            "DAVID STYAWAN",
            "ANDRIAN PRASETYO ARIFIN",
          ].some((foc) => dt.pic.includes(foc))
        )
          passMasukFoc.push(dt);
      });
      setNewPassMasukFoc(passMasukFoc);
    }
  }, [newPassMasukData]);

  useEffect(() => {
    if (listPenambahan.length) {
      let updatedPassMasuk: NewPassMasuk[] = newPassMasukData.map(
        (passMasuk) => {
          let newWorkingTool: string[] = [];
          let newPic: string[] = [];
          let newVendor: string[] = [];
          listPenambahan.map((penambahan) => {
            if (penambahan.passId === passMasuk.passId) {
              if (penambahan.workingTool) {
                newWorkingTool = [
                  ...newWorkingTool,
                  "<span>" + penambahan.workingTool,
                ];
              }
              if (penambahan.pic) {
                newPic = [
                  ...newPic,
                  ...penambahan.pic
                    .toUpperCase()
                    .split(/\s*[,;&-]\s*/)
                    .filter((pic) => pic !== "")
                    .map((pic) => "<span>" + pic),
                ];
              }
              if (penambahan.vendor) {
                newVendor = [
                  ...newVendor,
                  ...penambahan.vendor
                    .toUpperCase()
                    .split(/\s*[,;&-]\s*/)
                    .filter((vendor) => vendor !== "")
                    .map((vendor) => "<span>" + vendor),
                ];
              }
            }
          });
          return {
            ...passMasuk,
            workingTool: [passMasuk.workingTool, ...newWorkingTool].join("|"),
            pic: [...passMasuk.pic, ...newPic],
            vendor: [...passMasuk.vendor, ...newVendor],
          };
        }
      );
      setNewPassMasukData(updatedPassMasuk);
      setListPenambahan([]);
    }
  }, [listPenambahan]);

  const splitCSVData = (
    parsedData: any[]
  ): { passMasuk: PassMasuk[]; asset: Asset[] } => {
    let passMasuk: PassMasuk[] = [];
    let asset: Asset[] = [];
    let keyControl: string = "";

    parsedData.forEach((data: any[]) => {
      if (data.length !== 1) {
        if (data.includes("BCAPurpose")) {
          keyControl = "Pass Masuk";
          return;
        }
        if (data.includes("CIStatus")) {
          keyControl = "Asset";
          return;
        }
        if (keyControl === "Pass Masuk")
          passMasuk.push({
            passId: data[1],
            requestor: data[2],
            purpose: data[3],
            workingTool: data[4],
            clockIn: data[5],
            clockOut: data[6],
            pic: data[7],
            vendor: data[8],
          });
        if (keyControl === "Asset")
          asset.push({
            passId: data[1],
            requestor: data[2],
            purpose: data[3],
            location: data[4],
            ciName: data[5],
            ciStatus: data[6],
            tagNumber: data[7],
            manufacturer: data[8],
            model: data[9],
            serialNumber: data[10],
            room: data[11],
            rack: data[12],
          });
      }
    });

    return { passMasuk, asset };
  };

  const convertPassMasukFormat = (
    passIdList: string[],
    data: PassMasuk[]
  ): NewPassMasuk[] => {
    const formattedData: NewPassMasuk[] = passIdList.map((passId) => {
      const filteredData: PassMasuk[] = data.filter(
        (dt) => dt.passId === passId
      );
      return {
        passId: passId,
        requestor: filteredData[0].requestor,
        purpose: filteredData[0].purpose,
        workingTool: filteredData[0].workingTool,
        clockIn: filteredData[0].clockIn,
        clockOut: filteredData[0].clockOut,
        pic: filteredData.filter((dt) => dt.pic !== "").map((dt) => dt.pic),
        vendor: filteredData
          .filter((dt) => dt.vendor !== "")
          .map((dt) => dt.vendor),
        isSelected: false,
      };
    });
    return formattedData;
  };

  const convertAssetFormat = (
    passIdList: string[],
    data: Asset[]
  ): NewAsset[] => {
    const formattedData: NewAsset[] = passIdList.map((passId) => {
      const filteredData: Asset[] = data.filter((dt) => dt.passId === passId);
      return {
        passId: passId,
        requestor: filteredData[0]?.requestor ?? "",
        purpose: filteredData[0]?.purpose ?? "",
        location: filteredData[0]?.location ?? "",
        item: filteredData.map((dt) => {
          return {
            ciName: dt.ciName,
            ciStatus: dt.ciStatus,
            tagNumber: dt.tagNumber,
            manufacturer: dt.manufacturer,
            model: dt.model,
            serialNumber: dt.serialNumber,
            room: dt.room,
            rack: dt.rack,
          };
        }),
      };
    });
    return formattedData.filter((dt) => dt.item.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: false,
        complete: (result) => {
          const data: any[] = result.data as any[];
          dataStore(data);
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  };

  const dataStore = (data: any[]): void => {
    const { passMasuk, asset } = splitCSVData(data);
    let newPassIdList: string[] = [];
    passMasuk.forEach((dt) => {
      if (!newPassIdList.includes(dt.passId)) newPassIdList.push(dt.passId);
    });
    setPassIdList(newPassIdList);
    setNewPassMasukData(convertPassMasukFormat(newPassIdList, passMasuk));
    setNewAssetData(convertAssetFormat(newPassIdList, asset));
  };

  const headerPassMasuk = () => {
    return (
      <thead>
        <tr>
          <th className="checkbox">
            <input
              type="checkbox"
              className="form-check-input"
              onChange={(e) => {
                const updatedPassMasukData = newPassMasukData.map((item) => ({
                  ...item,
                  isSelected: e.target.checked,
                }));
                setNewPassMasukData(updatedPassMasukData);
              }}
            />
          </th>
          <th>No</th>
          <th>Pass ID</th>
          <th>Requestor</th>
          <th>Purpose & Activity</th>
          <th>Working Tools</th>
          <th>Clock In</th>
          <th>Clock Out</th>
          <th>PIC BCA</th>
          <th>Vendor / Anak Perusahaan</th>
        </tr>
      </thead>
    );
  };

  const bodyPassMasuk = (data: NewPassMasuk[], baseIndex?: number) => {
    return (
      <tbody>
        {data.map((dt, index) => {
          return (
            <tr>
              <td className="checkbox">
                <input
                  type="checkbox"
                  checked={dt.isSelected}
                  className="form-check-input"
                  onChange={(e) => {
                    const updatedPassMasukData = [...newPassMasukData];
                    updatedPassMasukData[index] = {
                      ...updatedPassMasukData[index],
                      isSelected: e.target.checked,
                    };
                    setNewPassMasukData(updatedPassMasukData);
                  }}
                />
              </td>
              <td>{baseIndex ?? index + 1}</td>
              <td>{dt.passId}</td>
              <td>{dt.requestor}</td>
              <td>
                {dt.purpose.split("\r\n").map((dt2) => {
                  return <p>{dt2}</p>;
                })}
              </td>
              <td>
                {dt.workingTool.split("|").map((dt2) => {
                  return (
                    <p className={dt2.startsWith("<span>") ? "highlight" : ""}>
                      {dt2.replace("<span>", "")}
                    </p>
                  );
                })}
              </td>
              <td>{dt.clockIn}</td>
              <td>{dt.clockOut}</td>
              <td>
                {dt.pic.map((dt2) => {
                  return (
                    <p
                      className={
                        dt2.startsWith("<span>") ? "noWrap highlight" : "noWrap"
                      }
                    >
                      {dt2.replace("<span>", "")}
                    </p>
                  );
                })}
              </td>
              <td>
                {dt.vendor.map((dt2) => {
                  return (
                    <p
                      className={
                        dt2.startsWith("<span>") ? "noWrap highlight" : "noWrap"
                      }
                    >
                      {dt2.replace("<span>", "")}
                    </p>
                  );
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  const headerChecklist = () => {
    return (
      <thead>
        <tr>
          <th>No</th>
          <th>Pass ID</th>
          <th>Requestor</th>
          <th>Purpose & Activity</th>
          <th>Masuk</th>
        </tr>
      </thead>
    );
  };

  const bodyChecklist = (data: NewPassMasuk[], baseIndex?: number) => {
    return (
      <tbody>
        {data.map((dt, index) => {
          return (
            <tr>
              <td>{baseIndex ?? index + 1}</td>
              <td>{dt.passId}</td>
              <td>{dt.requestor}</td>
              <td>{dt.purpose.replace("\r\n", " - ")}</td>
              <td></td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  const headerAsset = () => {
    return (
      <thead>
        <tr>
          <th>No</th>
          <th>Pass ID</th>
          <th>Requestor</th>
          <th>Location</th>
          <th>Name CI</th>
          <th>CI Status</th>
          <th>Tag Number</th>
          <th>Manufacturer</th>
          <th>Model</th>
          <th>Serial Number</th>
          <th>Room</th>
          <th>Rack</th>
        </tr>
      </thead>
    );
  };

  const bodyAsset = (data: NewAsset[], baseIndex?: number) => {
    return (
      <tbody>
        {data.map((dt, index) => {
          return (
            <tr>
              <td>{baseIndex ?? index + 1}</td>
              <td>{dt.passId}</td>
              <td>{dt.requestor}</td>
              <td>{dt.location}</td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.ciName}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.ciStatus}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.tagNumber}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.manufacturer}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.model}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.serialNumber}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.room}</p>;
                })}
              </td>
              <td>
                {dt.item.map((item) => {
                  return <p className="noWrap">{item.rack}</p>;
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div>
      <div id="displayArea">
        <h1>Pass Masuk Grha Asia Cibitung (v{packageJson.version})</h1>
        <input
          id="import"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="buttonGroup">
          <label
            htmlFor="import"
            className="btn btn-success"
            style={{ marginRight: "10px" }}
          >
            Import
          </label>
          <button
            type="button"
            style={{ marginRight: "10px" }}
            className="btn btn-warning"
            data-bs-toggle="modal"
            data-bs-target="#modalPenambahan"
            onClick={() => {
              setPenambahan({
                passId: "",
                workingTool: "",
                pic: "",
                vendor: "",
              });
            }}
            disabled={!newPassMasukData.length}
          >
            Penambahan
          </button>
          <button
            type="button"
            style={{ marginRight: "10px" }}
            className="btn btn-primary"
            onClick={() => {
              const element = document.getElementById("passMasukSecurity");
              if (element) {
                element.classList.add("print");
                window.print();
                element.classList.remove("print");
              }
            }}
            disabled={!newPassMasukData.length}
          >
            Pass Masuk Security ({newPassMasukData.length})
          </button>
          <button
            type="button"
            style={{ marginRight: "10px" }}
            className="btn btn-primary"
            onClick={() => {
              const element = document.getElementById("passMasukFoc");
              if (element) {
                element.classList.add("print");
                window.print();
                element.classList.remove("print");
              }
            }}
            disabled={!newPassMasukFoc.length}
          >
            Pass Masuk FOC ({newPassMasukFoc.length})
          </button>
          <button
            type="button"
            style={{ marginRight: "10px" }}
            className="btn btn-primary"
            onClick={() => {
              const element = document.getElementById("passMasukSelected");
              if (element) {
                element.classList.add("print");
                window.print();
                element.classList.remove("print");
              }
            }}
            disabled={!newPassMasukSelected.length}
          >
            Selected Pass Masuk ({newPassMasukSelected.length})
          </button>
          <button
            type="button"
            style={{ marginRight: "10px" }}
            className="btn btn-primary"
            onClick={() => {
              const element = document.getElementById("asset");
              if (element) {
                element.classList.add("print");
                window.print();
                element.classList.remove("print");
              }
            }}
            disabled={!newAssetData.length}
          >
            CI Asset ({newAssetData.length})
          </button>
        </div>
        <div
          className="modal fade"
          id="modalPenambahan"
          aria-labelledby="modalPenambahanLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalPenambahanLabel">
                  Penambahan
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-label">Pass ID</label>
                        <select
                          className="form-select"
                          value={penambahan.passId}
                          onChange={(e) =>
                            setPenambahan({
                              ...penambahan,
                              passId: e.target.value,
                            })
                          }
                        >
                          <option value=""></option>;
                          {passIdList.map((passId) => {
                            return <option value={passId}>{passId}</option>;
                          })}
                        </select>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          value={penambahan.passId}
                          onChange={(e) =>
                            setPenambahan({
                              ...penambahan,
                              passId: e.target.value.replace(/[^0-9]/g, ""),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label">Working Tool</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={penambahan.workingTool}
                        onChange={(e) =>
                          setPenambahan({
                            ...penambahan,
                            workingTool: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">PIC BCA</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={penambahan.pic}
                        onChange={(e) =>
                          setPenambahan({ ...penambahan, pic: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Vendor</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={penambahan.vendor}
                        onChange={(e) =>
                          setPenambahan({
                            ...penambahan,
                            vendor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    setListPenambahan([...listPenambahan, penambahan]);
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          {newPassMasukData.length ? (
            <table className="table passMasuk table-bordered custom-border">
              {headerPassMasuk()}
              {bodyPassMasuk(newPassMasukData)}
            </table>
          ) : (
            <></>
          )}
        </div>
        <div>
          {newAssetData.length ? (
            <table className="table asset table-bordered custom-border">
              {headerAsset()}
              {bodyAsset(newAssetData)}
            </table>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div id="passMasukSecurity">
        {newPassMasukData.length ? (
          <>
            {newPassMasukData.map((dt, index) => {
              return (
                <>
                  <h1
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                    className={index > 0 ? "break" : ""}
                  >
                    Pass Masuk Data Center Grha Asia Cibitung (Approved)
                  </h1>
                  <p style={{ fontSize: "10px" }}>
                    Tanggal Visit: {moment().locale("id").format("D MMMM YYYY")}
                  </p>
                  <table className="table passMasuk table-bordered custom-border">
                    {headerPassMasuk()}
                    {bodyPassMasuk([dt], index + 1)}
                  </table>
                </>
              );
            })}
          </>
        ) : (
          <></>
        )}
        {newPassMasukData.length ? (
          <>
            <h1
              style={{ fontSize: "20px", fontWeight: "bold" }}
              className="break"
            >
              Checklist Pass Masuk Data Center Grha Asia Cibitung (Approved)
            </h1>
            <p style={{ fontSize: "10px" }}>
              Tanggal Visit: {moment().locale("id").format("D MMMM YYYY")}
            </p>
            <table className="table checklist table-bordered custom-border">
              {headerChecklist()}
              {bodyChecklist(newPassMasukData)}
            </table>
          </>
        ) : (
          <></>
        )}
      </div>
      <div id="passMasukFoc">
        {newPassMasukFoc.length ? (
          <>
            {newPassMasukFoc.map((dt, index) => {
              return (
                <>
                  <h1
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                    className={index > 0 ? "break" : ""}
                  >
                    Pass Masuk Data Center Grha Asia Cibitung (Approved)
                  </h1>
                  <p style={{ fontSize: "10px" }}>
                    Tanggal Visit: {moment().locale("id").format("D MMMM YYYY")}
                  </p>
                  <table className="table passMasuk table-bordered custom-border">
                    {headerPassMasuk()}
                    {bodyPassMasuk([dt], index + 1)}
                  </table>
                </>
              );
            })}
          </>
        ) : (
          <></>
        )}
      </div>
      <div id="passMasukSelected">
        {newPassMasukSelected.length ? (
          <>
            {newPassMasukData.map((dt, index) => {
              return dt.isSelected ? (
                <>
                  <h1
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                    className={index > 0 ? "break" : ""}
                  >
                    Pass Masuk Data Center Grha Asia Cibitung (Approved)
                  </h1>
                  <p style={{ fontSize: "10px" }}>
                    Tanggal Visit: {moment().locale("id").format("D MMMM YYYY")}
                  </p>
                  <table className="table passMasuk table-bordered custom-border">
                    {headerPassMasuk()}
                    {bodyPassMasuk([dt], index + 1)}
                  </table>
                </>
              ) : (
                <></>
              );
            })}
          </>
        ) : (
          <></>
        )}
      </div>
      <div id="asset">
        {newAssetData.length ? (
          <>
            {newAssetData.map((dt, index) => {
              return (
                <>
                  <h1
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                    className={index > 0 ? "break" : ""}
                  >
                    Asset Data Center Grha Asia Cibitung
                  </h1>
                  <p style={{ fontSize: "10px" }}>
                    Tanggal Asset: {moment().locale("id").format("D MMMM YYYY")}
                  </p>
                  <table className="table asset table-bordered custom-border">
                    {headerAsset()}
                    {bodyAsset([dt], index + 1)}
                  </table>
                </>
              );
            })}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
