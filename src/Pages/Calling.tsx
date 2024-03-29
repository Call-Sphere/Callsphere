import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CallEndMobile, InCallMobile, OutOfHours } from '../Components/CallingComponents';
import { isInHours } from '../Utils';

async function getNewClient(
	credentials: Credentials
): Promise<{ status: boolean; data: { client: User; script: string } | undefined } | undefined> {
	return new Promise(resolve => {
		axios
			.post(credentials.URL + '/getPhoneNumber', credentials)
			.then(result => {
				if (result) {
					if (result?.data?.OK) {
						resolve({ status: true, data: result.data.data });
					} else {
						resolve({ status: false, data: undefined });
					}
				} else {
					resolve(undefined);
				}
			})
			.catch(err => {
				if (err?.response?.data) {
					if (err.response.data?.OK) {
						resolve({ status: false, data: err.response.data });
					} else {
						resolve({ status: true, data: undefined });
					}
				} else {
					console.error(err);
					resolve(undefined);
				}
			});
	});
}

function Calling({ credentials, campaign }: { credentials: Credentials; campaign: Campaign }) {
	const [Page, setPage] = useState(<div className="CallingError">Récupération en cours...</div>);

	const client = useRef<User>();

	const navigate = useNavigate();

	useEffect(() => {
		async function cancel() {
			axios
				.post(credentials.URL + '/giveUp', {
					phone: credentials.phone,
					pinCode: credentials.pinCode,
					area: credentials.area
				})
				.then(() => navigate('/'))
				.catch(err => {
					if (err.response?.data?.message) {
						navigate('/');
					} else {
						console.error(err);
					}
				});
		}

		function getNextClient() {
			function next() {
				getNewClient(credentials).then(result => {
					const time = Date.now();
					if (typeof result != 'undefined') {
						if (result.data) {
							client.current = result.data.client;
							if (!result.status) {
								endCall();
							} else {
								setPage(
									<InCallMobile
										client={client.current}
										script={result.data.script}
										endCall={() => endCall(time)}
										cancel={cancel}
									/>
								);
							}
						} else {
							if (result.status) {
								setPage(<div className="CallingError">Aucun numéro disponible</div>);
							} else {
								setPage(<div className="CallingError">Aucune campagne n'est en cours</div>);
							}
						}
					} else {
						setPage(<div className="CallingError">Une erreur est survenue :/</div>);
					}
				});
			}
			if (!isInHours(campaign)) {
				setPage(<OutOfHours campaign={campaign} next={next} />);
				return;
			} else {
				next();
			}
		}

		function endCall(startTime?: number) {
			if (client.current) {
				setPage(
					<CallEndMobile
						credentials={credentials}
						client={client.current}
						time={startTime ? (Date.now() - startTime <= 600_000 ? Date.now() - startTime : 0) : 0}
						nextCall={getNextClient}
					/>
				);
			}
		}

		getNextClient();
	}, [credentials, navigate]);

	return <div className="Calling">{Page}</div>;
}

export default Calling;
