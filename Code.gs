const SHEETS = {
  Users: ["id", "fullName", "email", "username", "passwordHash", "salt", "role", "status", "createdAt", "profileImage"],
  Houses: ["id", "name", "description", "createdAt", "color"],
  Categories: ["id", "value", "createdAt"],
  Events: ["id", "value", "createdAt"],
  Points: ["id", "value", "createdAt"],
  Positions: ["id", "value", "createdAt"],
  ScoreEntries: ["id", "categoryId", "eventId", "awards", "createdBy", "createdAt"],
  Certificates: ["id", "athleteName", "houseId", "categoryId", "eventId", "position", "createdAt", "certificateNumber", "templateId"],
  Settings: ["key", "value"],
  PrintHistory: ["id", "certificateId", "printType", "scope", "printedAt"],
  Mutations: ["id", "result", "createdAt", "userId"],
  Sessions: ["token", "userId", "expiresAt"]
};
const ROLES = ["Master Admin", "House Master", "Field Recorder"];
const SESSION_DAYS = 7;
const PUBLIC_CERTIFICATE_TROPHY_JPEG_BASE64_ = [
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUEBAUEAwUFBAUGBgUGCA4JCAcHCBEMDQoOFBEVFBMRExMWGB8bFhceFxMTGyUcHiAhIyMjFRomKSYiKR8iIyL/2wBDAQYGBggHCBAJCRAiFhMWIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL/wAARCAEXALEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7Jooo6elZjCsOPU5j4j8gtm2ZjGF29CBnOfcg1WuddeZz9kYRwDOJCOWA7+wrl4tThe+dILuOScvv3K2W3ZznBryMTmcIySp3dnr6HXSw7kry67HptFUNL1BdRsxJja68MP61fr1YTjUipRd0zlaadmFFFFUIKKKKACiiigAooo/KgAooo/KgAooooAK8p8U+MbrTvi7oFhHPssN+2ZQeCGGCT9D6+ldr4u17+wNCeaMqLmXKw7ugOMlj7Ac183Sab4g8SyXmpQWV1qmSsrsse1VB5AxyScDoPXNcteq4tRgrs2pwvq9j6yor5X8JfETxP4YvPLuZ7i/sI2/e2d5zIq/7Lfy/IgV9PadfQ6ppdrfWpzDcxrImeuCM81rSrRqXtuiZ03DctUUflRWpmH5VT1RzHo94ynBETc+nFXPyqC7gFzY3EDAESxsmPqMUPYZxNtbJd6xaWMiA2zn519VVchfxP9a2fFKQSaaLVEVJsqySKvMeCOR+WMVy0V1cILe4t3CXAQFSemRwR+efzrpls4/EcEd9DP8AZ7xB5M2F3KcckYz79f5187l9Rzw1TD0v4mu/U7q8eWpGcvhM3S9VGmXfmTsotXDCUk/dxyG+nB/Oo/GHxN0/wtdQWsUX225cB3WNwAiHpz6ntTNa8LSWCyXEMt1e21x8s8L4IiGMZUAdD36+tfPfjG1s9JuTbaUbhzHCUXzXzs2jjk8nFaUKlbBR+r1OmqfS3U9jJ8vw+ZYl86bST0XdbH2BbzC4tYpkBCyoHAPUAjNSHgZOAK+SX8d/FLX9Ojl8N38DWEUaRMlsipKCFAJO7v7g1xN7c/EKe/iTWZtdkWWTYS7SEBfw4rvnmNFX5Xex5X9mVoy5anuvzPuRr21QfPcwL9ZBVA+J9DUkNrOnDHrcp/jXwjbTahZ31tPaJex3sUpQltx35J559qWKBDqlxb4eSbOwPIvy5JGT9a5KmbuOqgarK1s5n29dfEHwnZvtufEOmo3p54P8qrN8TfBiMFbxJpwYjIBl7V8RX2nGzm8qQqxJUjaOQM1W1VYzd6ftXhosfXDGtMPmft02lsrmdbAKlbXdn3O3xM8GowD+ItPUnoDJjNWbXx74WvZfLtddsJH9BKK+Mb7wjeWGoxPq1syJMm+Eno34+1Zvg+W5h8WTROJNjpKhYIeeDgVyrOnOlKpTinZXNXlkFJRctz7uTxPocjBU1nTmJ7C5T/GtGO6t5seTPC+em1wa+F28LLa6iEltZrqIXERL4IO0jnJHpn9Kz5NB1aCYfYGnt2WRirLOVwM8c5rSlncZ7xCeVcqupo+6PEt3d2HhXU7vTQhu7e3aSMOuQSBnp9K474W/Eb/hOrG7hu0RL+y2lygwHU5wcdjxXzTpX/CfwWksdr4lvDFK4j+yrcsxcsdo+ZuAMkdK6fRPDviP4YeJdUhvNViiubyzQkWrZXqfvEjOeOg65613xxUZx9tGXurf9CFTo06E6NRXqNpxf5o6j4ieN49c8TizVC2m24dRtyDIQDx7ZPGfQ1vfC7x9KuqW3h64s2kivHaSG6jGAh25KEegxgfSp/AHwzS9sp9S8VQmX7WRJArEq/PJY+x9D+VdpbeE/DfgWC71q3t2VoEZgWOduR0Uep6UqNKsp+2k7X39DinKFuRHE/FLSbdfF1rPDHGrz2zPLtAByDjJ+vH5V6P4GUJ4E0pVGFWLAH4mvINU12fWrue6vnUkjhcDhRnag9AM5Nex+DInh8EaSJMbmgD/AINyP0NZ4Wqq2InOOw6sXCCizoPyoo/KivSOYPyo/Kj8qPyoA8/1y2GnaxIiKywynzV2ngZPPH1z9Miq0OpzWsyyW8jowPzZfIb2Pauw8RaYdQ07dEoNxBllH94d1/H+YFebHZjEZwCMxkg5B7ivkczpVMJiPaU9FLVPz6nrYaSq0+V9Dc8W/E+Hw74cE62kr38x8pNq5jRj0Zj6e1eH+OLSQWsMGoXEdxqIMkZkV8uWUBjnp1DEfUAVvfEldWXwn5mm4+yxtuu0CcleMfN1wCK4TS7ceINX1fW5p3MU0Y8pwcMrkDev4ED9K9DCYr65Tk6+8Vp53uj38uwUsPGjXw1rym03vZKzS+av6jvhZqpttWaybzzBcnCl1wdwHBb8K95sc4GCRXlPgvT7V9avL0ptnt3MHlgYVXHBb64Feo20ojRc96+exnLGvOKVmnqTmdSFWtGUP5Y/fY6OGCNkyyIT6lRWJ4is1bSrsRogcwPtKqAQdp5rWtpwYs5rJ1u4zbyIehQg/lWEZS7nmWsY3h3S4dU+FeiXTQwNcLCfMkeMFnwxHJxk1zN5DbIzFrWAFeMiIf4VreC9cWX4YabY2h/exGRJTj7uHNc/rPiLQNMvXtNR1ezguh96J5PmH1x0/GuxKbqNRuZR0jqeV6tfyyfFHCTSeWkkahdxwOMHivRNMA8o+ua8z19Ui+J8MkLK8NyYpI5EIKuPUEdelejaZN+6rsxMVyQt2Ig9Xcv3n+pIzXPZAkNbN5J+6PPauba4AkYVzU4sts2NM1FdNs7+72b3to1uFUnGdkinFY154q1vxnrHiHVksZpbwT/6PBBC0m1FIRU4B9D+dYXivVzp3hi4RfvXRWPjrgMGP8q9J/ZQ13ddeINIlbLuFuUyeT2Netk9LmpyjLbmv9xriaKVD26Wqsj2lPiLbjw9ZyvZXEGqSwIz2dwhQwsR0b+ePTFeb61rd9rNz/pl5JIxzsRQNh5+6B0yPzrs/H50WXXIyuxdRjH76QNgY7A+rf04rkIvsrOj25WQoSS6nIBHf8KnM8VUdZ0r+6u36nBhqcVHmtqVdK0eXVL62sY2YPeOFOFA2p1Yn04Br6HhiSC3jhiAEcahVHoAMCuK8A6I8FvJqt3EFkuBttww5Ef972z/ACArufyr1MvoOjSvLdnNiKnPPToH5UUflRXec4UUfjR+NABXA+MPDjKJNQslYxEhpokHKHP+sX+o/Gu+/GkIBBB5B6g1hicPDEU3TnsaU6kqcuaJ4Tq09xNpd0kAR5miYRpICyMcd+2DXkfhO2ltLZIZVKS3N9+8jxjbggdPwr2nxxa2nhnU9twfLsr1j5CjJB/vD8P5EV5fZX8R+IduXCiBblWIJ4AHc18thaVTD4p0Z+Xz1Pv8gk5YepPk0Sck/NJq34jv",
  "AesLLquuRSqyym/kkZCPmG7BwfpmvVVXfbqw9K+Y7jVmi+Jfi+GFypbUGlV0boP84r6C8Ha2Nd8NQ3JZWkGUcr3I71hnNCUMZVqfZk0/vR5MKCll9LEJ33i15r/gWOptrgR2xZjgAVhalqsUwZQPbNTXRaWCOCI4MjYP0rSGjwCx2MoIxzXmOaizltc8g03U5fDXgDxYIQDqenSSzRx+qOflkHqBk/iK+erPWtRs0vmhm3tqeYrguoYyDOckkEg57ivoP4k6fNojW+u6XCJxaB0uIGJxJCwwyk+nNeCeGbnT4des59ZhZ9PWctLEnUr6CvqMulCVKVRK9/06Hn4hNSSL3h030thDM8LtbWF9GFl7JvJyg+uM/wD669ctL5oYsKAfrUPibxNout3OnaR4VjiXTLQfaZfLi8sB+irjHUAk/lWWDd3N/BZ2K755m2oucZrGvN1XzSXKVBWVlqdFcXwltzxg1jR8lyfWq1peSM09tcKUmiyGU9iDSzXK2unXE7HiNS1c6jbRGhyes2114i1W+W3BNlpFs8srHoDj+ZOBXRfs+a1DonxdsWurlbeC6jaBmdsKSRwCfrineFpbULfQXjD+zWsALt0JwfmBZvXOS1efaXth8RwlU3J5w2rjOQTxXt4f93S54rRO39fievhf9qp1MM/5bo+yPEsr33iC8bTXU2krn51UYJCjPPpnv71f8H+HDqVyZbhSdPtmw2/J85/7oJ6qO5/D1rFtPDXiSaK3h/suQJcW6vHcNKoWNiRkMvUEA5/DFezWFlDpunW9naqFhgQIoHt3rnweDlVrSr1o21ukfO1qyhBU4MsgAAAYAHQCloor3ThD8qKPxooAPxo/Gj8aPxoAPxo/Gj8aPxoA8p+O8B/4V/b3ykZsr2NjkdQ2VI/WvnqK1lfWrWOJS32pSEAGd2VPHvX098Yoll+D/iAOAdsKsPYh1rwXw9bxXcejTIdslvIjMc+nX9K8fGU74mLXl+Z+jcMYnkyiqpbJyX3xPNtb8NvaawdYsIsMVKXMGc/MBkMPUEAj2Neg/B/zbSDUihL6ddSB45C2fnxkr7cEGu2+J3gy08Oiy1TTUP8AZ92Nk0fVVJGSR7H731B9a5Pwrof/AAjdm4sLnzrK5nE6IwwYyFww9+OhrzcWmqcqFZ+8lo+6/wCAfPYSvelJRScZa/4X3Xr1PT9PAm1JAedqk/rXQyofIYD0rm/Dkgl1Nsf88z/OuvZAVI9q+Xm9QvbQ4XVNOXULd7W4QGK4DRPnuGBFfIep+FNc0XV57KbTrovZyOGZIWYFc8MCB0Nfb89pllPo2aka1U3hyOCK9DAZjLCXSV0zOtRVW2tj5T0Hw/No+j2t9fb0n1NDLscY2oDhfz612fgzTTqXi+CZWKpZKZWI7noB+tX/AIwS/Z9ZsFHAMLD/AMerU+E1mw0O8vZFwbiYKpPcKP8AEmu2viJVKLqvqYwgoy5UZ3jDwxb6ZJLq0bu893cnfnoqlc4x9R1rhLyzl1KxNpB9+Xk/TNez/EJP+KQlwMv5qbR75rzjQoR5TTydP5Ae/wBf5VGHrS9kpdUXKCcrdDH07TpIdO8Z2/lbLW1txGkmOuFJx9Twa5bwlGn/AAsDwqZkBjkuoAQehAkx/SvZ4tO2eDryEqFn1CGW4k9RuXj9MD868gn0i/8AC+q+F5b0qruYrqJlOcKxVh/Wvp8BepgJya0Ulb8n+Jpl02sxVO/xQmvwuvyP0Iopkbb4kbOdyg0+vRPnQooooAPxoo/GigA/Gj8aPxo/GgA/Gj8aKPxoA4X4vNt+D3iM+luP/Q1r5s8MXDQy2Sux+aaJNnrlhn9Aa+lfi3GZfhD4jUDJ+zZx9GFfM/hyRJvEuj2y9JL4kn2WNv8AEVySpe0xlNf1pdn2WUYj2ORYt+a/GyPqnxZpVrrnw+vbe5UCIW3mpn+Aqu4H9K+QI9QvLPVNLu4WmltIpDbzwqxxgEqHI+mOa+rviNo+q6p4Ba08PsTOhUvFk/vUAIKnBBI6HHfGK8k8O/A++utFGsand3EGoweY0diItqzZ6hgeQOMKOOma4sxw9SvVShHZPX9DxcrxkcI3KeqejXk9P+D8jQ8JXBh1KzlZspOzwsc5w3Uf0r03HFeX6RbI1rc2EO6G5VVuIfMH8QJHA/DFd9ous22t6THd2cquv3XAPKOOCpHYg9q+HqU5wk4zWqO2qot80NixKvFLt/0hfpTm/eEKvXNDkC5+nFY3sJM4rXdA07VdYgutRtlnktdwjD8qM46jv0q9p1tDaWwhtYkihU8Ii4Azz0q3qEeLpj2JqBJAiHccAckmr55PRs0stziPihdyppNra2uWldy5VRk4Axn9a4XTbnztStNAijLySgCWTcAFXq348132pXCXt5cXQIIkAgjHfZnk/jzXQeE/g3aW+l3Ou5d9ZugZbTfwIge3vkcc9q9/A4WdenyxW1387aHNXqxpK7e5ydnNJqPinxBEyFUhs0RAR1yGOR+JrF+OWmmTw14M1m0QmE6fEpcDABUD/wCKH5V1OlXFt/wml3pyhkvoIStzGyEFCCBtyevX6fnXKeNfGGm6n8AdP0VLsPrGnXRjlgKYKqGYZ+mCK+ywFKdTAtShy2VmvRPX5tXOLC1PY5jRlF3vL83/AJM+rNGkM3h/TZGOS9tGx/FRV+szw/8A8ivpP/XnF/6AK06o86W4UUUUCD8aKPxooAKPzo/Oj86ACij86PzoA5X4jSpD8MfETSthfsUi5PqRgfqRXyp4AhUfE/S7accC5yoY+oK4/HI/KvqT4nsi/C/XDKCU8kZHr8wr5L0vWHi8d6LrDoqKl0hwvA+VgKdan7PDrFreMkvk00z6Ph2q8RPEZY1dVKcpL/FFpr9T7l+lFIrBlDLyCMjFL+dI+cPOfGWl/ZZZHEKyWt4SVG3lJCOQCOhPUe+a5Xwa8M+hwzQ4gv8ABFwoXDlv9tTyT05Ne0XtnFf2clvOuUcdcfdPYj3B5ry3VwbDVQ+pJ/x7t5U0ij7oP3ZPof6+1fKZ/gHy+1hfz/rz/M9bA4i69nIsz3d1KghtbqKCb+JzAxOPbtT7axmsNOcS3lxeTMxYyS8Y9h6CrKRvd6ef7OvVBcfJMFD4rJ1Lww8qs93q9/JKwwBHJ5YX3AFfHaqLuzvTTkkcjq+o3mhXYkvdYmktZAcRTWhkI9twqOy1m31q2mllmuDaxfeZ4fJjJ9PVq2E0XU7dira3NLB2WWIEj8a5nxaGWCC0sXe6v5mKohPBJGOg7DOfwrooL281Bat/12N0rdi54J0D/hIPEEMUPzrC3m3Mw4VU3H9TjGPrnpX0cAAAAMAcACua8E+HpfD/AIZt4r91l1KVQ11KqBQW7KAOgHQCumr9KweGWHpKPU+cxNb2tR9lsfP0WnZ/aF8XXOD+7hQc/wC0FP8ASvFvFXg680vwYviWaSNrTV7iVY41zuTD8Z+uK+ndY09bb4l6rcrwb2xgJPupdf6CvPPi1Etp+zb4fiC8qyL+JVq9xYjlpTUftRs//AWY4SLli6Dk/hkrf+BI988Otu8KaQw6GzhP/jgrUrC8HSGXwHoDnq2nwH/yGK3a80UlZtBRRRQSH50UfnRQAfnR+dH50fnQAfnR+dH50fnQB578ZrkWvwk1cnOZNiD6lx/hXyetqT4TtbscgXssefcKh/rX1B8eLhYfhVcRk8zXEaj8Dn+leCSWCQ/Bq2kGPMj1Vt//AAKLP9BXfiqV8grS/vL9D0uF6/s+JcOu6a+9M+tPC1+up+D9IvEORNaxnj12gH9a2fzrgPg7d/a/hNo5xjyg8X5Ma7/8682nLmgpd0c+Oo+wxVSl/LJr7mH51h+INHF/b+fCm65iUjZxiVO6H+nvW5+dH505wjUi4yWjOeMnF3R49ptq+la26We82FxkPD3gkHPI7D+X5Vw/i99audRu5JPEt3pu2UrZQWiqqKFPBkzy5J5x0xXe/ELT/sXiiG/WN1iuSjsYXMZdx8hyR6Db",
  "+dY3ijwy2pwRf2dLFaArliVMm49yckV+b5v/ALDinDmS21avp9zPpMLKNaKnNXuc/F4iurrR4ZdTkBmhQLKkPCSSdyP6DpXoPw48HMzL4j1kRyT3ChrZMZCL1BH+eTz6V5Mvgy3vPFejaM1z/pNxJt+Q42oBkuBz6V9TWlsllYwW0OfLhQIufQDFfQcOYanODxKXocWZVZQtST3J6KKK+qPGPNfEt9GfiQ1qrDzY9OjZhnpmRq8a+M3iSCT4DeH7ON1+0NeNlAckBJCuf1rrdY1Dd+0lrEAYlf7PjjwfUBW/rXgGv2r3PjCPTXJcS60IQrHjBlJxXoZdTjiKVVv7Kf5NfqbYyMsJVw7X2uV/jf8AQ+2vh67SfDHw07/eOnQ5/wC+BXT1zPw/XZ8NvDyf3bGMfktdNXnLYmr/ABJeoUUUlMzF/Oij86KAD86PzoooAPzo/OiigDx79oCRD4L06BjgveBseoCnP8xXjz27/wDCkb64duJNWQoPQBCD/OvUP2hLhBp2iQfx+ZI/TtgCuGs7P7Z+zvqcrdYL0MP++h/jXuYuNuHJL+Zv+vwDh+ry8TUG+jX4tf5np37Pt29x8M3ic8W95Iq/QgGvXfzrxD9nVz/wjetR5O1blSB9Vr2+vmcFLmw8H5Ht8SU/Z5tXX95v79Q/Oj86KK6jxDz74mq8tlYQ+VmNpM+YOoIIrzXxhq+uaFDaxaAYdUidPnYwHdEc9Cd47egr074mTquk6fAwB824GD3GOleL+PdP+z6Te35luN0cKoiCUqgZieSB1PHFfCcQQhPMEpxTulv0/I93At/V1rbVkfgy3vpfjPoV/fyGV2YqW4UL14Az0ycYr6pr5C8Culr8WPDElxIQDKUyxz1HH6kV9e19DkOmDS8zizHWrfyCikor2jzz5Y1qdz+1jdxR5JmPl49f3I/wriNStMftB6PZyLy2vqSv0Ga7C4czftjv6R3fP0EVc3NKt7+1bpjRkMi6tMwI9o2/wrqyVy9nie2v5o9jiWnGMsEuvJF/gz628HxCDwXpUQORHAFyPat2uf8ABj+Z4I0lhzmAfzNb9cp5U01Jp7hRRRQQL+dFH50UAH4UfhR+FH4UAH4UfhR+FH4UAeCfH9BJqGhof+echP5isbQEWX9mzxGijLLcyEj6Mn+Fanx9fGu6GvbyHP8A49WV4HhkHwW8aibOx1dlBHQ+WCf6V9Fi482QxXr+v+ZzZM+XPefs4fmjof2cgRoev5II+0pg/wDAa90/CvCP2bm36Br5/wCnpP8A0Gvd/wAK+RwCthoH1HFD/wCFev6/og/Cj8KPwrN127Njod1OhAYLgZPqcf1rrlJRTb6HgpXdjz7xpcrqvjfTdPhHmCAFjgdDnH9f0ryb456jeaVqdvo0IQW13DFJKWHPDPjH5113hfWJLvxC+sJtMZ2x+RIWwu3Jypx33enYVxHx0ivvFHiKxvbCF5BFF5LpBG58vBzksQAevavgp16WLxUq03Z30Xl/wND3nSnRUaS2S/ExL9ZNMn0jVYGKy28qyKR1IGCf5V9haTqMOr6NaX9swaK5iWRSPcV8ebNSvdJtYr63VEixtfByeMdMcda9Y+BGu3Ml9qmiyuxt7bJjR85Qg8ivSyDEum/YS6/8Exx9Hmh7RdD3n8KKKO9fWHjHxpdX4g/ao1aW4frdzoD/ANszj+VYfgKb7f8AHrQbxs5m1CU5PvFIay/H891F8cNfu7FT5sWoSMpx6Zz+GM0nhG7Gl/E/wXIWAzqiIx/31Zf617+VYVU8uq1Hu/8AP/KxpxFjJVcxoQS0jGKXyir/AI3PsX4YX/2zwV5BIL2F1NasB22ucfoRXb15F8Db5L/S/Es0WPLl1R5Bg+v/AOqvXK+dp/CjozCKjip22vf79RaSiirOMX8KKPwooAPwo/Cj8KPwoAPwo/Cj8KPwoA+f/wBoaNlv9Bm2naY5FzjvkGq/gomP9nXWLicktcW9w5J9Au0fyrX/AGiFP9i6G+PlWaTP/fIqGztPsH7NtxEeGOlyMfxyf617OJqv+yIL/F/mGU04PMnfdyh+qGfs1ceHdeH/AE8p/wCg171+FeC/s1gjw/r2f+flP/Qa96r5vAf7tD0PoOKVbOK/r+iD8K8z+JPiQWsJ0+GPzZmYJFEOrykcfQDqT25r0mR1iieR+FRSx+gr5y8TPJrPxSit3ciBYPNfnnBYkr9D8o+nFcmc4h0cPZO1/wAjhyvDqvWd9oq52HgnwXFNo4SSWVOjb4zkE7QDj2yK8V+Kt1/wjPii/wBHS61C6TIkG6cLGCV/ulTz75r6Y0PW7Wy01Ufau0fSvk/4oJf+IfFWoa5JZXZsrmYrBMsR2FFJUc/hXyeFjhHGMk7zbd/08jrqVK0qsnLboT+F7CC88N27me7YhRkdhitXw/q9z4Q8aNqMMckMjyb2hfnep6jI65HII4NU/AV/FB4fWKQq20leR0waPE1yt3pNwqcPaMJI2PUITgr+ZB/OsqVedLFy5d7nTy89Ox9iaTqUOsaPa39rkw3MYdc+9Xu9edfB2+S7+H1vGr7jCeh6gHn/ABr0Sv0OjU9pTjPuj5ypHkm49j4c+IPgfxfofizV9Z1HS5V0+W/bdfKQYyjscEc554H4157q16bDVvDt0jYaHUopPyOa+3fjgcfB7V/96Lr/AL4r4e1nSptTuLCSJWMdnIJpNoz8u9F/D73Wvoctp+yyqvy9X/kc2bY+pj8woSq2XLGyt2Vz6f8A2Urx7vwfrrMxI+3Nj/vt6+iq+ef2XbI6boPiWyOMwag6/gJHA/lX0NXgR2+/8zvxf8TXtH/0lBRRRVHML+FFH4UUAH4UfhSUtAB+FH4UlLQB5V8d7Frv4exSIF/cXSE568gjj86g8TWosfgvqNsCB5Gk7Dn1CD+tegeK9Jj1vwpf2Uy7g6bgB1ypDD+VeVfGTXLbTvg/dNG4Yag8dvCUOQcnP5YU101a/NgXR7cz+9I2y6lbMadTu4/mN/ZtgK+EdYnJ4kuwoH0X/wCvXuf4V43+zjCyfCbzn6z3srD8MD+lex15uEhyUILyPT4gq+1zSvL+8/w0MjxHfLY6LKzkDzPk5+hJ/QV89eFJ7jxN4v1PVAuyzlPkxSN1ODxj1GOSfU47V6v8VNRltvCeoG2UytFEU8oDqzDjn6GvPPBGn3On+HrGyzG1xAmD845Oc9fxr5Xiauub2b7fnu/yOzKlGlhJ1PtSdvl1/Q7qbwPqs1gxtLyAlhwCSK8FvvGKaXbyaLr12Z5dPdodkdqWVcHkBt3P1xXv95qPiG00aUw6bPKVjO3y/m7e1fNOqeGdNuYEl/txba9PzXEd6EGG7j72evrXkUIYeMUvZyjte93fzWhkpVW9WmV/CdjNqzXkunOsVq1w5jV8ghfpW7e+GXAuree6DSTw/u1A4ZgQwGfwrA8Iy3Nld3lraAXQjl4kg5VuO36V0OrnUXRJJlS32nIaVwMYqMRKccTo9NDpoW0TO8+A/iTyNRbSJWIVhsAPqOQf6V9G18Y/Di6ew+Ir+ReI5EwZp1GVAJyOvsa+x7W4S7s4biI5jmQOp9iM19xlFRyouL6P/gnh46HLVPPfjj/yRzWPrH/6GK+TdDgSa110yZ2w6Y8gwe4liP8ASvsD4vQJcfCPX0cAgQqw+oYGvl74b6Outavr2mMM/aNFuAv1G0j9RX22C/5FVf1X6HzuI/3+l6f5nvHwS0xdO1XxuFbIbUEIx0wymT+bmvY68k+DUvmal41Gc7NQjU/URAGvW6+cg7q59BjoOFeUX5fkgoooqjkF/Cij8qKACj8qKKACiiigArzvxr8J9K8bWiWd5e3dpYC7W7a3ttoBcAg4JHyg7ucd+a9EpKOlioycJKUXZozNA0HTvDGg2uk6Lbi3sbVdsaZJPqSSeSSe9alJSMwRSzEAAZJoE25O73OP1u2ivbzUbeaMSo7IGj9coK58eD9Nkf8A0dp4yPvBXGAemOeaPD+snWX1i9eRQ732",
  "0Z6BQqhR+VdCLiCPAMgEkoO0KfmOK58VgcNilavBSNKdepS+B2MqTwSv9nSJHqVyqlcMNzD+RFeWax8OrESlYY4Zlzyzvgk/iua+hD/yDmJOCVPv2rwrVvNW6fCqAWPWLP6156yHBx+BOPpJ/wCZv9dq9dfkc/D4EtdNBK2qxNcMAqx3bFmPrtC9KzbzwfYs/mXc1yykf6qOQZP58/pXeSy2NsjKPJFxMuElYKDjHTOCcHOMHvXOXN6qBcQCIggKEJOAO2P4cnsM5zzSjlWEpz5rXfm2/wBS/rVWStczdA0210+6b7BbxxF2wX2sHYDud3Ptj8a+ofD3/Ir6X0/49Y+n+6K+aNKBm1B58mIG4bdGzcjGOwOOfWvSvgp4k1DV11mxvLgz2li4FtuHKKSeM+lewoKKtFWOWrJyk22dh8UIzL8KvESjr9lJ/Ig18W6f4uufB+tpNZAedqUTWKkjO3zGUZ/LNfcnjSIz+AdfjVdxaxmAGOvyGvz31n95caO/OUvYzXvYCV8uxEfRnk143x1Dzuj65/Z/kaceNZ9wKSasdv5Hmvba8L/ZmG7wNrMx5aXUTk/8AH+Ne6V83hnelFn1GfRUcyrRXR2+5JBRRRW55Av5UUflRQAlLSUtABRRRQAUlLSUAFZHie/TS/CWqXkrBEht2JbOMcY61r15l8epvJ+BniI7tpeNEHPq60ID5zbxzqfhu8+1aTKktrO/72Fvmjf0J9D7iun8P/Ge+a7Bu7KIqxxsVW4HpxkfpXhfgPRh4k8VR6Tc3l1b28sbuTbuAcqMjqCK9fh+D1lbuGh17WkZehWVAR/47XJiczw+Fn7Oo3f0OmlhalaPNE96h+JHhu70jbLeRwysnzI8nl4P44riNTm0iaQsk9rsJzkXBGPyNcVefDY3tt5N94t8RSw4xskuUxj/AL5rmZPgp4UeF5m1y/aIE7pDLGVGDg87cda4/wC2cNLaT+43WBqLdL7zuLzxfpOkwtFca1p6QREFFWVGcHOfQt1968k1z4r7L6f+yrcSLu+WZ5WIPOeBgEfmK6ZPgL4eZFaDVdSKsMgq8ZBH/fNMk+A2jj7uraoPxT/4mpWc4OL1k/uH9SrdF+J5OPHOvXl1JHHcmGOZ8uUHIz6E8ivrf9m143tde2OrMvkg4OccNXy38SvAkHgZNNbTr66n+2Fw3nbRt246YA9a9f8A2OLqRfEXiu1c5EltDJye4Zh/WvVoV4YimqtN3TOOtGUJuMtz7AuYRc2k8LYxKhQ/iMV+et7prJ4kNnKCrWl2wIIwcqT/AIV+h9cj4w8IaZqvhfXRBpFrJqN3bOVkSFRI8gX5Tu65zivQw+M9hSq07X51Y51RU8RSqN25Wmee/syrj4Y3rf3r9z/46te4V5H+z/4f1bw58Obi216xmsriS9d1imGG24UZx9Qa9crzqEXGlFPserm9WNbH1qkHdOTs/mFFFFanmi/lRR+VFACUUUUAFFFFABRRRQAV4/8AtIS+X8Er5R/y0uYV/wDHs/0r2CvEP2nbpYfhHHAfvXF9GB+AY00B8vfCMbfidaZ7wS/+g19E6nqUOlae91cBmVeioMsfoO/rXzv8Jv8AkqFl/wBcJf8A0GvfLuN7rXraGVM20Y3/ADKSCw5+menPXrXyedQTxi5trf5ntYB/udO5Wh0qbW7QSa8zDcwZIoXKrgHKtg/dPPNUnutMAvLG202D7Ejusiu5Uytkbyo7gE9fWuvJwCfSvPo9W077b5r6ffhZ5JcRFcGNhy/zDnDEDjpmvPoN1ObTbZI6p+60dS2mJef2bc2NzNawwKCI4uBIu3ChvXFWLS9juZJIgWWSM4xJgMwHG7HXGadpGoRanpUF1BE8MbghY5Bgrg46fhWRq+dP8R2F7DFI32k+TN5Nv5hx2yf4R7+1c/K5ycJbq9i72XMjy39oFcR+H/8Aem/ktb37IMqp8Q9fiLAGTTgQPXEgrE/aC/1Hh7/fm/ktZn7OXiXT/C3xbW61mbyLSa0khMp6ITggn24r7DJf9yj8/wA2eJj/AOOz9AaKjgniuraOe2kSWGVQyOhyGB6EGpK9M4wooooAKKKKAF/Kij8aKAEoopaAEopaSgAooooAK+Ovj/4ruNduZLcyZsra6KQIOgC5BP4kGvrrU7tbDR727c4WCB5D+AJr8/8A4g38ZkghllAfhipPPOST+tVECP4UnHxQsP8ArjL/AOg19KV80fClgfihp5BBBil6f7pr6ULivkc+X+0r0X6nt5d/CfqUbbV4LvU7myiDeZb/AHycfyqnPq2mQXEsJgDyRttYJEDkn09T9KrWejT2erNci6BSU75to2l2/wAOemajvNBMustqEM0ZmZlO2cFkXb0wM/jXkpU1LfQ9pRw/PZvS34mjqGs2mjeTHLG6iQgKI0woJOB/+qtO3lM0CyFHjLDOyQYYfWsTWNJTWbSKO6kZmiKsADtXcCMt69M961osRxqikkKMAsST+JPWsZKLirbmU/ZezXL8XU8X/aCH+j+H/wDfm/kteQ+HnMetRf7asp/KvXfj+2bbw/z/AMtJf5LXjGnzxwanbNJIqAPySa+3yX/c4fP82fN47+Oz7Y/Z58U6hfrf6FdS+ZZWUCy24PVMsQQD6V79Xyx+zVcoPGuqRE/NLYAj8HH+NfU9ek9zjCiiikAUUUUALRR+NFACUUUUAFFFFABRRRQBy3xDt9Ru/h5q9votu9zeyxbVhQgM4yNwGe+M18AeLtA1601q6m13Sru1kkcnEsLKAOgAJFfpRUVxbQXcLRXcMU0TDBSRAwP4GqTsB+VpurvSruOfT5pbabBKyxPtbB4PIqx/wmXiQdNa1H/wIav0fl+FvgeadpZfCukNI3U/Zl5oX4W+B0+74V0gf9uy1Mowk7yVxqUlomfnAfGfiUH/AJDWo/8Af80n/CbeJh/zHNQ/7/mv0j/4Vl4KP/MraR/4Cr/hTD8LvA56+FNH/wDAVan2dL+VfcivaT7s/N4+OfEwP/Id1D/v8aUePPFA+7r2oD/tsa/R1vhT4EcEN4T0c/8AbstVW+DXw8br4R0r8IcUeyo/yr7kHtJ92fm3qniLVtbWJdX1G5u1iJKCZ923PXFU4LeSeQJbxPK56BQST+VfphH8Gvh5FIHTwjpW4dMw5/nXQ6V4P8O6G27R9D06zb+9Dbqp/PFXHlirRViG29WfMf7MPhrxJZeKzf6tpN5aWKWToLieMoHyRgDPJNfXFFFDdwCiiikAUUUUAH40UfjRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAC0UUUAf/2Q=="
].join("");

function doGet(event) {
  ensureSheets_();
  const certificateNumber = String(event && event.parameter && event.parameter.certificate || "").trim();
  if (certificateNumber) return publicCertificatePage_(certificateNumber);
  return json_({ ok: true, message: "Fieldhouse API is ready." });
}

function publicCertificatePage_(certificateNumber) {
  const matches = rows_("Certificates").filter(function (item) {
    return String(item.certificateNumber || certificateNumber_(item.id, item.createdAt)) === certificateNumber;
  });
  if (matches.length !== 1) {
    return HtmlService.createHtmlOutput(certificatePageShell_(
      "<section class=\"certificate-not-found\"><span class=\"status-pill\">RECORD NOT FOUND</span><h1>We could not find this certificate.</h1><p>Check the certificate number or contact the school that issued it.</p></section>",
      "Certificate record not found"
    )).setTitle("Certificate record not found").addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  const certificate = matches[0];
  const school = schoolSettings_();
  const house = rows_("Houses").find(function (item) { return String(item.id) === String(certificate.houseId); });
  const category = rows_("Categories").find(function (item) { return String(item.id) === String(certificate.categoryId); });
  const event = rows_("Events").find(function (item) { return String(item.id) === String(certificate.eventId); });
  const awardDate = new Date(certificate.createdAt);
  const resolvedCertificateNumber = String(certificate.certificateNumber || certificateNumber_(certificate.id, certificate.createdAt));
  const dateLabel = isNaN(awardDate.getTime())
    ? String(certificate.createdAt || "")
    : Utilities.formatDate(awardDate, Session.getScriptTimeZone(), "MMMM d, yyyy");
  const certificates = rows_("Certificates");
  const certificateIndex = certificates.findIndex(function (item) { return String(item.id) === String(certificate.id); });
  const baseTemplateId = Number(school.templateId) || 1;
  const templateId = Number(certificate.templateId) || ((baseTemplateId - 1 + Math.max(0, certificateIndex)) % 20) + 1;
  const svg = publicCertificateSvg_(certificate, school, house, category, event, dateLabel, resolvedCertificateNumber, templateId);
  const imageName = String(certificate.athleteName || "certificate").trim().replace(/[^\w-]+/g, "-") || "certificate";
  const body = "<div class=\"certificate-stage\">" + svg + "</div>"
    + "<p class=\"verification-note\">Verified certificate record. This page shows the details stored by the school.</p>"
    + "<div class=\"page-actions\"><button class=\"action-button\" id=\"savePicture\" type=\"button\">Save as picture (PNG)</button>"
    + "<button class=\"action-button secondary\" type=\"button\" onclick=\"window.print()\">Print certificate</button></div>"
    + "<span id=\"imageName\" hidden>" + htmlEscape_(imageName) + "</span>";
  return HtmlService.createHtmlOutput(certificatePageShell_(body, "Certificate for " + certificate.athleteName))
    .setTitle("Certificate for " + certificate.athleteName)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function certificatePageShell_(content, title) {
  return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>" + htmlEscape_(title)
    + "</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>"
    + "body{margin:0;padding:22px;background:#e8ede8;color:#17231d;font-family:Arial,sans-serif}.page{width:min(1200px,100%);margin:0 auto}.certificate-stage{width:100%;aspect-ratio:1400/990;background:#fffefa;box-shadow:0 16px 44px #173d3122}.certificate-svg{display:block;width:100%;height:100%}"
    + ".verification-note{margin:14px auto;color:#526158;text-align:center;font-size:13px;line-height:1.55}.page-actions{display:flex;justify-content:center;gap:10px}.action-button{padding:11px 18px;border:0;border-radius:7px;background:#173d31;color:#fff;font-weight:700;cursor:pointer}.action-button.secondary{border:1px solid #cad4cb;background:#fff;color:#173d31}.certificate-not-found{padding:36px;border-radius:10px;background:#fff;text-align:center}.status-pill{color:#a32020;font-size:12px;font-weight:800;letter-spacing:1px}.certificate-not-found h1{color:#173d31}.certificate-not-found p{color:#526158;line-height:1.6}"
    + "@page{size:A4 landscape;margin:8mm}@media(max-width:600px){body{padding:10px}.page-actions{flex-direction:column}.action-button{width:100%}}"
    + "@media print{body{padding:0;background:#fff}.page{width:281mm;margin:0}.certificate-stage{width:274.2mm;height:194mm;margin:0 auto;aspect-ratio:auto;box-shadow:none}.verification-note,.page-actions{display:none}}"
    + "</style></head><body><main class=\"page\">" + content + "</main><script>"
    + "document.getElementById('savePicture')&&document.getElementById('savePicture').addEventListener('click',function(){var svg=document.getElementById('certificate-artwork');var source=new XMLSerializer().serializeToString(svg);var url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));var image=new Image();image.onerror=function(){URL.revokeObjectURL(url);alert('The certificate picture could not be created.');};image.onload=function(){var canvas=document.createElement('canvas');canvas.width=1400;canvas.height=990;var context=canvas.getContext('2d');if(!context){URL.revokeObjectURL(url);alert('This browser cannot create certificate pictures.');return;}context.drawImage(image,0,0,1400,990);URL.revokeObjectURL(url);canvas.toBlob(function(blob){if(!blob){alert('The certificate picture could not be saved.');return;}var link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(document.getElementById('imageName').textContent||'certificate')+'.png';link.click();setTimeout(function(){URL.revokeObjectURL(link.href);},1000);},'image/png');};image.src=url;});"
    + "</script></body></html>";
}

function publicCertificateSvg_(certificate, school, house, category, event, dateLabel, certificateNumber, templateId) {
  const templates = [
    ["geometric","#10354a","#f0b429"],["modern","#303337","#ed8b00"],["heritage","#315f91","#a8c6df"],["modern","#174c86","#e2bd59"],
    ["classic","#063b73","#f1c51b"],["geometric","#176653","#d3a62d"],["heritage","#927342","#d8be82"],["modern","#152852","#e93632"],
    ["geometric","#101e49","#88bd3d"],["geometric","#1768b5","#27b9db"],["geometric","#6e2034","#d7ad4a"],["heritage","#1f5a46","#d6ba62"],
    ["classic","#513c78","#d7bf8a"],["modern","#1c5d83","#48a8c4"],["classic","#762e3e","#d9af55"],["modern","#75422f","#e3a15b"],
    ["geometric","#146367","#d3a62d"],["heritage","#36434e","#c0c6ce"],["classic","#223f73","#d9b540"],["geometric","#a64b35","#ebc457"]
  ];
  const selected = templates[Math.max(0, Math.min(19, Number(templateId) - 1))];
  const family = selected[0], primary = selected[1], accent = selected[2];
  const text = function (value) { return htmlEscape_(value || ""); };
  const fittedLine = function (value, x, y, size, color, weight, width) {
    const content = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const fitSize = Math.min(size, width / (Math.max(1, Array.from(content).length) * 0.58));
    return "<text x=\"" + x + "\" y=\"" + y + "\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"" + fitSize + "\" font-weight=\"" + (weight || 400) + "\" fill=\"" + color + "\">" + text(content) + "</text>";
  };
  const designs = [
    "<path d=\"M0 990V835H175L0 990ZM1400 990V835H1225L1400 990Z\" fill=\"" + primary + "\"/><path d=\"M0 990V910H92L0 990ZM1400 990V910H1308L1400 990Z\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 0H25V990H0ZM1375 0H1400V990H1375Z\" fill=\"" + primary + "\"/><path d=\"M25 0H42V210H25ZM1358 780H1375V990H1358Z\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 965H1400V990H0Z\" fill=\"" + primary + "\"/><path d=\"M0 925H280V950H0ZM1120 925H1400V950H1120Z\" fill=\"" + accent + "\"/>",
    "<circle cx=\"700\" cy=\"12\" r=\"52\" fill=\"" + primary + "\"/><circle cx=\"700\" cy=\"12\" r=\"28\" fill=\"" + accent + "\"/>",
    "<circle cx=\"0\" cy=\"990\" r=\"150\" fill=\"" + primary + "\"/><circle cx=\"0\" cy=\"990\" r=\"92\" fill=\"" + accent + "\"/><circle cx=\"1400\" cy=\"990\" r=\"150\" fill=\"" + primary + "\"/><circle cx=\"1400\" cy=\"990\" r=\"92\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 990V860L130 990ZM1400 990V860L1270 990Z\" fill=\"" + accent + "\"/><path d=\"M0 990V925L65 990ZM1400 990V925L1335 990Z\" fill=\"" + primary + "\"/>",
    "<rect x=\"0\" y=\"0\" width=\"36\" height=\"990\" rx=\"18\" fill=\"" + primary + "\"/><rect x=\"1364\" y=\"0\" width=\"36\" height=\"990\" rx=\"18\" fill=\"" + primary + "\"/><rect x=\"0\" y=\"420\" width=\"36\" height=\"150\" fill=\"" + accent + "\"/><rect x=\"1364\" y=\"420\" width=\"36\" height=\"150\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 965H1400V990H0Z\" fill=\"" + accent + "\"/><rect x=\"65\" y=\"930\" width=\"26\" height=\"35\" rx=\"8\" fill=\"" + primary + "\"/><rect x=\"1309\" y=\"930\" width=\"26\" height=\"35\" rx=\"8\" fill=\"" + primary + "\"/>",
    "<path d=\"M0 410H34V580H0ZM1366 410H1400V580H1366Z\" fill=\"" + primary + "\"/><path d=\"m0 410 34 85-34 85Zm1400 0-34 85 34 85Z\" fill=\"" + accent + "\"/>",
    "<path d=\"M625 0H775L700 52Z\" fill=\"" + primary + "\"/><circle cx=\"700\" cy=\"18\" r=\"13\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 990V875H125L0 990ZM1400 990V875H1275L1400 990Z\" fill=\"" + accent + "\"/><path d=\"M0 990V940H55L0 990ZM1400 990V940H1345L1400 990Z\" fill=\"" + primary + "\"/>",
    "<rect x=\"0\" y=\"0\" width=\"18\" height=\"990\" fill=\"" + accent + "\"/><rect x=\"1382\" y=\"0\" width=\"18\" height=\"990\" fill=\"" + accent + "\"/><rect x=\"18\" y=\"0\" width=\"12\" height=\"990\" fill=\"" + primary + "\"/><rect x=\"1370\" y=\"0\" width=\"12\" height=\"990\" fill=\"" + primary + "\"/>",
    "<path d=\"M0 990V900L90 990ZM1400 990V900L1310 990Z\" fill=\"" + primary + "\"/><circle cx=\"150\" cy=\"965\" r=\"22\" fill=\"" + accent + "\"/><circle cx=\"1250\" cy=\"965\" r=\"22\" fill=\"" + accent + "\"/>",
    "<rect x=\"0\" y=\"970\" width=\"1400\" height=\"20\" fill=\"" + primary + "\"/><rect x=\"0\" y=\"938\" width=\"160\" height=\"18\" fill=\"" + accent + "\"/><rect x=\"1240\" y=\"938\" width=\"160\" height=\"18\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 990V870H32V930H92V990ZM1400 990V870H1368V930H1308V990Z\" fill=\"" + primary + "\"/><path d=\"M0 990V940H50V990ZM1400 990V940H1350V990Z\" fill=\"" + accent + "\"/>",
    "<rect x=\"0\" y=\"470\" width=\"28\" height=\"160\" rx=\"14\" fill=\"" + primary + "\"/><rect x=\"1372\" y=\"300\" width=\"28\" height=\"160\" rx=\"14\" fill=\"" + primary + "\"/><circle cx=\"14\" cy=\"550\" r=\"10\" fill=\"" + accent + "\"/><circle cx=\"1386\" cy=\"380\" r=\"10\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 990V860Q0 830 30 830H125L0 990ZM1400 990V860Q1400 830 1370 830H1275L1400 990Z\" fill=\"" + primary + "\"/><path d=\"M0 990V925H65L0 990ZM1400 990V925H1335L1400 990Z\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 0H45V190H0ZM1355 0H1400V190H1355Z\" fill=\"" + primary + "\"/><path d=\"M0 0H90V30H0ZM1310 0H1400V30H1310Z\" fill=\"" + accent + "\"/>",
    "<rect x=\"0\" y=\"952\" width=\"1400\" height=\"38\" fill=\"" + primary + "\"/><path d=\"m0 952 38 38H0Zm1400 0-38 38h38Z\" fill=\"" + accent + "\"/>",
    "<path d=\"M0 990 90 900l90 90Zm1400 0-90-90-90 90Z\" fill=\"" + accent + "\"/><path d=\"m0 990 90-52 90 52Zm1400 0-90-52-90 52Z\" fill=\"" + primary + "\"/>"
  ];
  const frame = family === "heritage"
    ? "<rect x=\"28\" y=\"28\" width=\"1344\" height=\"934\" fill=\"none\" stroke=\"" + primary + "\" stroke-width=\"14\"/>"
    : family === "classic"
      ? "<rect x=\"30\" y=\"30\" width=\"1340\" height=\"930\" rx=\"24\" fill=\"none\" stroke=\"" + primary + "\" stroke-width=\"9\"/>"
      : family === "modern"
        ? "<rect x=\"28\" y=\"28\" width=\"1344\" height=\"934\" fill=\"none\" stroke=\"" + primary + "\" stroke-width=\"5\"/>"
        : "<rect x=\"28\" y=\"28\" width=\"1344\" height=\"934\" rx=\"10\" fill=\"none\" stroke=\"" + primary + "\" stroke-width=\"8\"/>";
  const safeLogo = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(school.logo || "") ? school.logo : "";
  const sideLogo = function (x) {
    if (safeLogo) return "<image href=\"" + text(safeLogo) + "\" x=\"" + x + "\" y=\"62\" width=\"100\" height=\"100\" preserveAspectRatio=\"xMidYMid meet\"/>";
    return "<text x=\"" + (x + 50) + "\" y=\"136\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"58\" font-weight=\"700\" fill=\"" + primary + "\">" + text((school.schoolName || "S").charAt(0).toUpperCase()) + "</text>";
  };
  const watermark = safeLogo ? "<image href=\"" + text(safeLogo) + "\" x=\"500\" y=\"285\" width=\"400\" height=\"400\" opacity=\".075\" preserveAspectRatio=\"xMidYMid meet\"/>" : "";
  const trophy = "<image href=\"data:image/jpeg;base64," + PUBLIC_CERTIFICATE_TROPHY_JPEG_BASE64_ + "\" x=\"105\" y=\"345\" width=\"280\" height=\"410\" preserveAspectRatio=\"xMidYMid meet\"/>";
  const medalColors = {1:"#c59624",2:"#87939b",3:"#a86432",4:"#3d7fa6",5:"#4d8c62",6:"#7653a3",7:"#bc6d35",8:"#a74362",9:"#328c91",10:"#586b7a"};
  const awardColor = medalColors[Number(certificate.position)] || primary;
  const detail = function (label, value, x, valueColor) {
    const valueSize = Math.min(24, 235 / (Math.max(1, Array.from(String(value || "")).length) * 0.62));
    return "<text x=\"" + x + "\" y=\"635\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"17\" font-weight=\"700\" letter-spacing=\"1\" fill=\"#24332b\">" + text(label) + "</text><text x=\"" + x + "\" y=\"675\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"" + valueSize + "\" font-weight=\"700\" fill=\"" + (valueColor || primary) + "\">" + text(value || "\u2014") + "</text>";
  };
  const date = new Date(certificate.createdAt);
  const year = isNaN(date.getTime()) ? "" : date.getFullYear();
  const sealName = school.schoolName || "Amazing Grace Digital";
  const sealLabel = sealName.length > 28 ? sealName.slice(0, 27) + "\u2026" : sealName;
  let qr = "";
  try {
    const url = ScriptApp.getService().getUrl() + "?certificate=" + encodeURIComponent(certificateNumber);
    qr = certificateQrSvg_(url, 1185, 725, 150);
  } catch (error) {
    qr = "<rect x=\"1185\" y=\"725\" width=\"150\" height=\"150\" fill=\"#fff\" stroke=\"#ad3030\" stroke-width=\"3\"/><text x=\"1260\" y=\"805\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"14\" font-weight=\"700\" fill=\"#ad3030\">QR UNAVAILABLE</text>";
  }
  return "<svg id=\"certificate-artwork\" class=\"certificate-svg\" xmlns=\"http://www.w3.org/2000/svg\" width=\"1400\" height=\"990\" viewBox=\"0 0 1400 990\" role=\"img\" aria-label=\"Certificate for " + text(certificate.athleteName) + "\">"
    + "<defs><linearGradient id=\"certificate-paper\" x2=\"1\" y2=\"1\"><stop stop-color=\"#fffefa\"/><stop offset=\".58\" stop-color=\"#fffdf7\"/><stop offset=\"1\" stop-color=\"#fffaf0\"/></linearGradient></defs><rect width=\"1400\" height=\"990\" fill=\"url(#certificate-paper)\"/>"
    + designs[Math.max(0, Math.min(19, Number(templateId) - 1))] + frame + watermark + sideLogo(110) + sideLogo(1190)
    + fittedLine(school.schoolName || "School Name",700,105,38,"#15231d",700,900)
    + fittedLine(school.motto || "",700,145,21,primary,700,900)
    + fittedLine(school.address || "",700,180,17,"#34453d",600,900)
    + fittedLine("SPORTS ACHIEVEMENT",880,275,19,accent,700,820)
    + fittedLine(school.meetTitle || "1st Annual Inter-Athlete Sports Meet",880,318,30,primary,700,820)
    + trophy
    + "<text x=\"880\" y=\"415\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"#24332b\">THIS CERTIFICATE IS PROUDLY PRESENTED TO</text>"
    + fittedLine(certificate.athleteName,880,490,58,primary,700,790)
    + fittedLine("In recognition of outstanding effort, sportsmanship, and achievement.",880,550,21,"#24332b",600,780)
    + "<rect x=\"470\" y=\"590\" width=\"815\" height=\"128\" rx=\"14\" fill=\"#eff4ee\"/>"
    + detail("EVENT",event ? event.value : "\u2014",570)
    + detail("CATEGORY",category ? category.value : "\u2014",780)
    + detail("POSITION",publicCertificateOrdinal_(certificate.position),990,awardColor)
    + detail("HOUSE",house ? house.name : "\u2014",1200)
    + "<g aria-label=\"" + text(sealName) + " school seal for " + year + "\"><circle cx=\"700\" cy=\"820\" r=\"67\" fill=\"#fffdf8\" fill-opacity=\".92\" stroke=\"" + primary + "\" stroke-width=\"3\"/><circle cx=\"700\" cy=\"820\" r=\"58\" fill=\"none\" stroke=\"" + accent + "\" stroke-width=\"2\"/><path id=\"school-seal-arc\" d=\"M644 815 A56 56 0 0 1 756 815\" fill=\"none\"/><text font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"700\" letter-spacing=\"1\" fill=\"" + primary + "\"><textPath href=\"#school-seal-arc\" startOffset=\"50%\" text-anchor=\"middle\">" + text(sealLabel) + "</textPath></text><text x=\"700\" y=\"823\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"12\" font-weight=\"700\" fill=\"" + primary + "\">OFFICIAL SEAL</text><text x=\"700\" y=\"842\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"" + primary + "\">" + year + "</text></g>"
    + "<text x=\"1260\" y=\"714\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"14\" font-weight=\"700\" letter-spacing=\"2\" fill=\"#a32020\">" + text(certificateNumber) + "</text>"
    + qr
    + "<text x=\"145\" y=\"895\" text-anchor=\"start\" font-family=\"Arial,sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"#24332b\">" + text(dateLabel) + "</text><text x=\"1255\" y=\"895\" text-anchor=\"end\" font-family=\"Arial,sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"#24332b\">School Authority</text></svg>";
}

function certificateQrSvg_(payload, x, y, size) {
  const specs = [[19,7,1],[34,10,1],[55,15,1],[80,20,1],[108,26,1],[136,18,2],[156,20,2],[194,24,2],[232,30,2],[274,18,4]];
  const alignment = [[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
  const appendBits = function (target, value, count) {
    for (let bit = count - 1; bit >= 0; bit--) target.push((value >>> bit) & 1);
  };
  const multiply = function (a, b) {
    let result = 0;
    for (let bit = 7; bit >= 0; bit--) {
      result = (result << 1) ^ ((result >>> 7) * 0x11d);
      result ^= ((b >>> bit) & 1) * a;
    }
    return result;
  };
  const divisor = function (degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = multiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = multiply(root, 2);
    }
    return result;
  };
  const remainder = function (data, coefficients) {
    const result = new Array(coefficients.length).fill(0);
    data.forEach(function (value) {
      const factor = value ^ result.shift();
      result.push(0);
      for (let i = 0; i < result.length; i++) result[i] ^= multiply(coefficients[i], factor);
    });
    return result;
  };
  let version = 1, bytes = Utilities.newBlob(String(payload)).getBytes().map(function (value) { return value & 255; });
  while (version <= specs.length) {
    const spec = specs[version - 1];
    if (bytes.length < (version < 10 ? 256 : 65536) && bytes.length * 8 + (version < 10 ? 8 : 16) + 4 <= spec[0] * 8) break;
    version++;
  }
  if (version > specs.length) throw new Error("Certificate URL exceeds QR capacity.");
  const spec = specs[version - 1], capacity = spec[0] * 8, bits = [];
  appendBits(bits, 4, 4);
  appendBits(bits, bytes.length, version < 10 ? 8 : 16);
  bytes.forEach(function (value) { appendBits(bits, value, 8); });
  appendBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
    data.push(value);
  }
  for (let pad = 0xec; data.length < spec[0]; pad ^= 0xec ^ 0x11) data.push(pad);
  const total = spec[0] + spec[1] * spec[2], shortBlocks = spec[2] - total % spec[2];
  const shortDataLength = Math.floor(total / spec[2]) - spec[1], blocks = [];
  let offset = 0;
  for (let i = 0; i < spec[2]; i++) {
    const length = shortDataLength + (i >= shortBlocks ? 1 : 0), block = data.slice(offset, offset + length);
    offset += length;
    blocks.push({data:block,ecc:remainder(block,divisor(spec[1]))});
  }
  const codewords = [], longest = Math.max.apply(null, blocks.map(function (block) { return block.data.length; }));
  for (let i = 0; i < longest; i++) blocks.forEach(function (block) { if (i < block.data.length) codewords.push(block.data[i]); });
  for (let i = 0; i < spec[1]; i++) blocks.forEach(function (block) { codewords.push(block.ecc[i]); });
  const matrixSize = version * 4 + 17;
  const matrix = Array.from({length:matrixSize}, function () { return new Array(matrixSize).fill(null); });
  const setFunction = function (cx, cy, dark) { if (cx >= 0 && cy >= 0 && cx < matrixSize && cy < matrixSize) matrix[cy][cx] = !!dark; };
  const finder = function (cx, cy) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunction(cx + dx, cy + dy, distance !== 2 && distance !== 4);
    }
  };
  finder(3,3); finder(matrixSize - 4,3); finder(3,matrixSize - 4);
  for (let i = 8; i < matrixSize - 8; i++) {
    setFunction(6,i,i % 2 === 0); setFunction(i,6,i % 2 === 0);
  }
  alignment[version - 1].forEach(function (cy) {
    alignment[version - 1].forEach(function (cx) {
      if ((cx === 6 && cy === 6) || (cx === matrixSize - 7 && cy === 6) || (cx === 6 && cy === matrixSize - 7)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        setFunction(cx + dx,cy + dy,Math.max(Math.abs(dx),Math.abs(dy)) !== 1);
      }
    });
  });
  if (version >= 7) {
    let remainderBits = version;
    for (let i = 0; i < 12; i++) remainderBits = (remainderBits << 1) ^ ((remainderBits >>> 11) * 0x1f25);
    const versionBits = (version << 12) | remainderBits;
    for (let i = 0; i < 18; i++) {
      const bit = ((versionBits >>> i) & 1) !== 0, a = matrixSize - 11 + i % 3, b = Math.floor(i / 3);
      setFunction(a,b,bit); setFunction(b,a,bit);
    }
  }
  const drawFormat = function () {
    let remainderBits = (1 << 3);
    for (let i = 0; i < 10; i++) remainderBits = (remainderBits << 1) ^ ((remainderBits >>> 9) * 0x537);
    const formatBits = (((1 << 3) << 10) | remainderBits) ^ 0x5412;
    const bit = function (i) { return ((formatBits >>> i) & 1) !== 0; };
    for (let i = 0; i <= 5; i++) setFunction(8,i,bit(i));
    setFunction(8,7,bit(6)); setFunction(8,8,bit(7)); setFunction(7,8,bit(8));
    for (let i = 9; i < 15; i++) setFunction(14 - i,8,bit(i));
    for (let i = 0; i < 8; i++) setFunction(matrixSize - 1 - i,8,bit(i));
    for (let i = 8; i < 15; i++) setFunction(8,matrixSize - 15 + i,bit(i));
    setFunction(8,matrixSize - 8,true);
  };
  drawFormat();
  const allBits = [];
  codewords.forEach(function (value) { appendBits(allBits,value,8); });
  let bitIndex = 0, upward = true;
  for (let right = matrixSize - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < matrixSize; vertical++) {
      const cy = upward ? matrixSize - 1 - vertical : vertical;
      for (let offsetX = 0; offsetX < 2; offsetX++) {
        const cx = right - offsetX;
        if (matrix[cy][cx] !== null) continue;
        const value = bitIndex < allBits.length ? allBits[bitIndex++] === 1 : false;
        matrix[cy][cx] = value ^ ((cx + cy) % 2 === 0);
      }
    }
    upward = !upward;
  }
  drawFormat();
  const extent = matrixSize + 8, unit = size / extent, squares = [];
  matrix.forEach(function (row, rowIndex) {
    row.forEach(function (dark, columnIndex) {
      if (!dark) return;
      const px = x + (columnIndex + 4) * unit, py = y + (rowIndex + 4) * unit;
      squares.push("M" + px.toFixed(2) + " " + py.toFixed(2) + "h" + unit.toFixed(2) + "v" + unit.toFixed(2) + "h-" + unit.toFixed(2) + "z");
    });
  });
  return "<g role=\"img\" aria-label=\"Certificate QR code\" shape-rendering=\"crispEdges\"><rect x=\"" + x + "\" y=\"" + y + "\" width=\"" + size + "\" height=\"" + size + "\" fill=\"#ffffff\"/><path d=\"" + squares.join("") + "\" fill=\"#111111\"/></g>";
}

function publicCertificateDetail_(label, value) {
  return "<div class=\"certificate-detail\"><span>" + htmlEscape_(label) + "</span><b>" + htmlEscape_(value || "\u2014") + "</b></div>";
}

function publicCertificateOrdinal_(value) {
  const position = Number(value);
  if (!Number.isInteger(position) || position < 1) return "\u2014";
  const lastTwo = position % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? "th" : ({1:"st",2:"nd",3:"rd"}[position % 10] || "th");
  return position + suffix + " place";
}

function htmlEscape_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function doPost(event) {
  let body;
  try {
    body = JSON.parse(event.postData.contents || "{}");
  } catch (error) {
    return json_({ ok: false, error: "The request body is not valid JSON." });
  }
  if (body.action === "getSystemStatus") {
    try {
      return json_({ ok: true, closed: isSystemClosed_() });
    } catch (error) {
      return json_({ ok: false, error: "The system status could not be read." });
    }
  }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    ensureSheets_();
    if (isSystemClosed_() && body.action !== "getSystemStatus" && body.action !== "unlockSystem") {
      const closedError = new Error("AMAZING GRACE DIGITAL SPORT MANAGEMENT SYSTEM has been closed for now.");
      closedError.systemClosed = true;
      throw closedError;
    }
    const mutationId = String(body.clientMutationId || "").trim();
    let mutationUser = null;
    if (mutationId) {
      if (!/^[\w-]{1,100}$/.test(mutationId)) throw new Error("Invalid mutation identifier.");
      mutationUser = requireUser_(body.token);
      const previous = rows_("Mutations").find(function (item) {
        return String(item.id) === mutationId && String(item.userId) === String(mutationUser.id);
      });
      if (previous) return json_(JSON.parse(previous.result));
    }
    const result = dispatch_(body);
    const response = Object.assign({ ok: true }, result || {});
    if (mutationId) append_("Mutations", { id: mutationId, result: JSON.stringify(response), createdAt: now_(), userId: String(mutationUser.id) });
    return json_(response);
  } catch (error) {
    return json_({
      ok: false,
      systemClosed: !!(error && error.systemClosed) || isSystemClosed_(),
      sessionExpired: !!(error && error.sessionExpired),
      error: error && error.message ? error.message : "The request could not be completed."
    });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function dispatch_(request) {
  switch (request.action) {
    case "getSystemStatus": return { closed: isSystemClosed_() };
    case "unlockSystem": return unlockSystem_(request);
    case "setSystemClosed": return setSystemClosed_(request, requireRole_(request.token, ["Master Admin"]));
    case "register": return register_(request);
    case "login": return login_(request);
    case "getDashboard": return { data: dashboard_(requireUser_(request.token)) };
    case "updateProfile": return updateProfile_(request, requireUser_(request.token));
    case "setUserStatus": return setUserStatus_(request, requireRole_(request.token, ["Master Admin"]));
    case "deleteUser": return deleteUser_(request, requireRole_(request.token, ["Master Admin"]));
    case "addHouses": return addHouses_(request, requireRole_(request.token, ["Master Admin"]));
    case "updateHouse": return updateHouse_(request, requireRole_(request.token, ["Master Admin"]));
    case "deleteHouse": return deleteHouse_(request, requireRole_(request.token, ["Master Admin"]));
    case "addOptions": return addOptions_(request, requireRole_(request.token, ["Master Admin"]));
    case "deleteOption": return deleteOption_(request, requireRole_(request.token, ["Master Admin"]));
    case "clearOptions": return clearOptions_(request, requireRole_(request.token, ["Master Admin"]));
    case "addScoreEntry": return addScoreEntry_(request, requireRole_(request.token, ["Master Admin", "House Master", "Field Recorder"]));
    case "clearScoreEntries": return clearScoreEntries_(request, requireRole_(request.token, ["Master Admin"]));
    case "addCertificates": return addCertificates_(request, requireRole_(request.token, ["Master Admin", "House Master", "Field Recorder"]));
    case "updateCertificate": return updateCertificate_(request, requireRole_(request.token, ["Master Admin", "House Master", "Field Recorder"]));
    case "deleteCertificate": return deleteCertificate_(request, requireRole_(request.token, ["Master Admin", "House Master", "Field Recorder"]));
    case "clearCertificates": return clearCertificates_(request, requireRole_(request.token, ["Master Admin"]));
    case "saveSchoolSettings": return saveSchoolSettings_(request, requireRole_(request.token, ["Master Admin"]));
    case "clearSchoolInfo": return clearSchoolInfo_(request, requireRole_(request.token, ["Master Admin"]));
    case "recordPrintBatch": return recordPrintBatch_(request, requireUser_(request.token));
    case "resetPrintHistory": return resetPrintHistory_(request, requireRole_(request.token, ["Master Admin"]));
    default: throw new Error("Unknown request.");
  }
}

function isSystemClosed_() {
  return PropertiesService.getScriptProperties().getProperty("SYSTEM_CLOSED") === "true";
}

function setSystemClosed_(request, actor) {
  if (request.closed !== true) throw new Error("The system can only be reopened by signing in as a Master Admin.");
  if (!actor || actor.role !== "Master Admin") throw new Error("Only a Master Admin can close the system.");
  PropertiesService.getScriptProperties().setProperty("SYSTEM_CLOSED", "true");
  clearData_("Sessions");
  return { closed: true };
}

function unlockSystem_(request) {
  const username = String(request.username || "").trim().toLowerCase();
  const password = String(request.password || "");
  if (!username || !password) throw new Error("Enter the Master Admin username and password.");
  const user = rows_("Users").find(function (item) {
    return String(item.username).toLowerCase() === username;
  });
  if (!user || user.passwordHash !== passwordHash_(password, user.salt)) {
    throw new Error("Invalid Master Admin username or password.");
  }
  if (user.role !== "Master Admin" || user.status !== "Approved") {
    throw new Error("Only an approved Master Admin can reopen the system.");
  }
  PropertiesService.getScriptProperties().deleteProperty("SYSTEM_CLOSED");
  const token = Utilities.getUuid() + Utilities.getUuid();
  append_("Sessions", { token: token, userId: user.id, expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 });
  return { closed: false, user: publicUser_(user, true), token: token };
}

function ensureSheets_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Bind this Apps Script project to a Google spreadsheet.");
  Object.keys(SHEETS).forEach(function (name) {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    const headers = SHEETS[name];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    } else {
      const lastColumn = sheet.getLastColumn();
      const current = sheet.getRange(1, 1, 1, Math.max(lastColumn, headers.length)).getValues()[0];
      headers.forEach(function (header, index) {
        if (current[index] === header) return;
        if (index >= lastColumn && !current[index]) {
          sheet.getRange(1, index + 1).setValue(header);
          current[index] = header;
          return;
        }
        throw new Error("Unexpected columns in the " + name + " sheet.");
      });
    }
  });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function rows_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(function (row) { return row.some(function (cell) { return cell !== ""; }); }).map(function (row) {
    const result = {};
    headers.forEach(function (header, index) { result[header] = row[index]; });
    return result;
  });
}

function append_(name, object) {
  const headers = SHEETS[name];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  sheet.appendRow(headers.map(function (header) { return object[header] === undefined ? "" : object[header]; }));
}

function updateById_(name, id, updates) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("id");
  const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[idIndex]) === String(id); });
  if (rowIndex < 1) throw new Error("The requested record was not found.");
  Object.keys(updates).forEach(function (key) {
    const column = headers.indexOf(key);
    if (column >= 0) sheet.getRange(rowIndex + 1, column + 1).setValue(updates[key]);
  });
}

function deleteById_(name, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("id");
  const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[idIndex]) === String(id); });
  if (rowIndex < 1) throw new Error("The requested record was not found.");
  sheet.deleteRow(rowIndex + 1);
}

function clearData_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
}

function now_() {
  return new Date().toISOString();
}

function makeId_() {
  return Utilities.getUuid();
}

function register_(request) {
  const fullName = String(request.fullName || "").trim();
  const email = String(request.email || "").trim().toLowerCase();
  const username = String(request.username || "").trim();
  const password = String(request.password || "");
  const role = String(request.role || "");
  if (!fullName || !username || !email || !password) throw new Error("Complete all required registration fields.");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (ROLES.indexOf(role) < 0) throw new Error("Select a valid role.");
  const users = rows_("Users");
  if (users.some(function (user) { return String(user.username).toLowerCase() === username.toLowerCase(); })) throw new Error("That username is already registered.");
  if (users.some(function (user) { return String(user.email).toLowerCase() === email; })) throw new Error("That email address is already registered.");
  const salt = Utilities.getUuid() + Utilities.getUuid();
  const isFirstUser = users.length === 0;
  const assignedRole = isFirstUser ? "Master Admin" : role;
  const status = isFirstUser ? "Approved" : "Pending";
  append_("Users", {
    id: makeId_(), fullName: fullName, email: email, username: username,
    passwordHash: passwordHash_(password, salt), salt: salt, role: assignedRole, status: status, createdAt: now_(), profileImage: ""
  });
  return { status: status, role: assignedRole };
}

function login_(request) {
  const username = String(request.username || "").trim().toLowerCase();
  const password = String(request.password || "");
  const role = String(request.role || "");
  const user = rows_("Users").find(function (item) { return String(item.username).toLowerCase() === username; });
  if (!user || user.passwordHash !== passwordHash_(password, user.salt)) throw new Error("Invalid username or password.");
  if (user.role !== role) throw new Error("The selected role does not match this account.");
  if (user.status !== "Approved")   return { user: publicUser_(user, true), token: "" };
  const token = Utilities.getUuid() + Utilities.getUuid();
  append_("Sessions", { token: token, userId: user.id, expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 });
  return { user: publicUser_(user, true), token: token };
}

function passwordHash_(password, salt) {
  let value = salt + password;
  for (let iteration = 0; iteration < 10000; iteration++) {
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
    value = Utilities.base64Encode(digest);
  }
  return value;
}

function publicUser_(user, includeProfileImage) {
  const result = { id: String(user.id), fullName: String(user.fullName), email: String(user.email), username: String(user.username), role: String(user.role), status: String(user.status) };
  if (includeProfileImage) result.profileImage = String(user.profileImage || "");
  return result;
}

function updateProfile_(request, user) {
  const currentPassword = String(request.currentPassword || "");
  if (!currentPassword || passwordHash_(currentPassword, user.salt) !== user.passwordHash) {
    throw new Error("Your current password is incorrect.");
  }
  const username = String(request.username || "").trim();
  if (!username || username.length > 50) throw new Error("Enter a username of up to 50 characters.");
  const users = rows_("Users");
  if (users.some(function (item) {
    return String(item.id) !== String(user.id) && String(item.username).toLowerCase() === username.toLowerCase();
  })) throw new Error("That username is already registered.");

  const updates = { username: username };
  if (Object.prototype.hasOwnProperty.call(request, "profileImage")) {
    const profileImage = String(request.profileImage || "");
    if (profileImage && (profileImage.length > 40000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(profileImage))) {
      throw new Error("Choose a supported profile picture smaller than 30 KB.");
    }
    updates.profileImage = profileImage;
  }
  const newPassword = String(request.newPassword || "");
  if (newPassword) {
    if (newPassword.length < 8) throw new Error("Your new password must contain at least 8 characters.");
    const salt = Utilities.getUuid() + Utilities.getUuid();
    updates.passwordHash = passwordHash_(newPassword, salt);
    updates.salt = salt;
  }
  updateById_("Users", user.id, updates);
  return { user: publicUser_(Object.assign({}, user, updates), true) };
}

function requireUser_(token) {
  if (!token) throw sessionError_("Please sign in again.");
  const now = Date.now();
  const session = rows_("Sessions").find(function (item) { return item.token === token && Number(item.expiresAt) > now; });
  if (!session) throw sessionError_("Your session has expired. Please sign in again.");
  const user = rows_("Users").find(function (item) { return String(item.id) === String(session.userId); });
  if (!user || user.status !== "Approved") throw sessionError_("This account is no longer approved. Please sign in again.");
  return user;
}

function sessionError_(message) {
  const error = new Error(message);
  error.sessionExpired = true;
  return error;
}

function requireRole_(token, roles) {
  const user = requireUser_(token);
  if (roles.indexOf(user.role) < 0) throw new Error("You do not have permission to perform this action.");
  return user;
}

function dashboard_(user) {
  const data = {
    houses: rows_("Houses"),
    categories: rows_("Categories"),
    events: rows_("Events"),
    points: rows_("Points"),
    positions: rows_("Positions"),
    scoreEntries: rows_("ScoreEntries").map(function (entry) {
      entry.awards = entry.awards ? JSON.parse(entry.awards) : [];
      return entry;
    }),
    certificates: rows_("Certificates"),
    schoolSettings: schoolSettings_(),
    printHistory: rows_("PrintHistory")
  };
  if (user.role === "Master Admin") data.users = rows_("Users").map(publicUser_);
  return data;
}

function schoolSettings_() {
  const saved = {};
  rows_("Settings").forEach(function (item) { saved[String(item.key)] = String(item.value || ""); });
  return {
    schoolName: saved.schoolName || "",
    motto: saved.motto || "",
    address: saved.address || "",
    logo: saved.logo || "",
    meetTitle: saved.meetTitle || "1st Annual Inter-Athlete Sports Meet",
    templateId: saved.templateId || "1",
    certificatesPerPage: saved.certificatesPerPage || "2"
  };
}

function saveSchoolSettings_(request) {
  const schoolName = String(request.schoolName || "").trim();
  const motto = String(request.motto || "").trim();
  const address = String(request.address || "").trim();
  const meetTitle = String(request.meetTitle || "").trim();
  const logo = String(request.logo || "");
  const templateId = String(request.templateId || "");
  const certificatesPerPage = String(request.certificatesPerPage || "");
  if (!schoolName || schoolName.length > 120) throw new Error("Enter a school name of up to 120 characters.");
  if (motto.length > 200) throw new Error("The school motto must be 200 characters or fewer.");
  if (address.length > 300) throw new Error("The school address must be 300 characters or fewer.");
  if (!meetTitle || meetTitle.length > 120) throw new Error("Enter a meet title of up to 120 characters.");
  if (logo && (logo.length > 40000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(logo))) {
    throw new Error("Choose a supported school logo smaller than 30 KB.");
  }
  if (!/^(?:[1-9]|1\d|20)$/.test(templateId)) throw new Error("Choose a certificate template from 1 to 20.");
  if (certificatesPerPage !== "1" && certificatesPerPage !== "2") throw new Error("Choose one or two certificates per page.");

  const updates = {
    schoolName: schoolName,
    motto: motto,
    address: address,
    logo: logo,
    meetTitle: meetTitle,
    templateId: templateId,
    certificatesPerPage: certificatesPerPage
  };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  const values = sheet.getDataRange().getValues();
  const keyIndex = values[0].indexOf("key");
  Object.keys(updates).forEach(function (key) {
    const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[keyIndex]) === key; });
    if (rowIndex < 1) {
      sheet.appendRow([key, updates[key]]);
      values.push([key, updates[key]]);
    } else {
      sheet.getRange(rowIndex + 1, 2).setValue(updates[key]);
    }
  });
  return { schoolSettings: schoolSettings_() };
}

function clearSchoolInfo_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  const values = sheet.getDataRange().getValues();
  const keyIndex = values[0].indexOf("key");
  ["schoolName", "motto", "address", "logo"].forEach(function (key) {
    const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[keyIndex]) === key; });
    if (rowIndex > 0) sheet.getRange(rowIndex + 1, 2).clearContent();
  });
  return {};
}

function recordPrintBatch_(request) {
  const printType = String(request.printType || "");
  const scope = String(request.scope || "");
  const ids = request.certificateIds;
  if (printType !== "certificate" && printType !== "list") throw new Error("Choose a valid print type.");
  if (scope !== "all" && !rows_("Houses").some(function (house) { return String(house.id) === scope; })) {
    throw new Error("Choose a valid house for this print batch.");
  }
  if (!Array.isArray(ids) || !ids.length || ids.length > 2000) throw new Error("Choose between 1 and 2,000 certificates to record.");

  const certificates = rows_("Certificates");
  const history = rows_("PrintHistory");
  const seen = {};
  const selected = [];
  ids.forEach(function (id) {
    const certificateId = String(id);
    if (seen[certificateId]) return;
    seen[certificateId] = true;
    const certificate = certificates.find(function (item) { return String(item.id) === certificateId; });
    if (!certificate) throw new Error("A certificate in this print batch no longer exists.");
    if (scope !== "all" && String(certificate.houseId) !== scope) throw new Error("A certificate does not belong to the selected house.");
    selected.push(certificateId);
  });

  const recordedIds = [];
  selected.forEach(function (certificateId) {
    if (history.some(function (item) {
      return String(item.certificateId) === certificateId && item.printType === printType && String(item.scope) === scope;
    })) return;
    append_("PrintHistory", {
      id: makeId_(), certificateId: certificateId, printType: printType,
      scope: scope, printedAt: now_()
    });
    recordedIds.push(certificateId);
  });
  return { recordedIds: recordedIds };
}

function resetPrintHistory_() {
  clearData_("PrintHistory");
  return {};
}

function setUserStatus_(request, actor) {
  if (String(request.userId) === String(actor.id)) throw new Error("You cannot change your own account status.");
  const user = rows_("Users").find(function (item) { return String(item.id) === String(request.userId); });
  if (!user) throw new Error("The requested user was not found.");
  if (request.status !== "Approved" && request.status !== "Denied") throw new Error("Invalid user status.");
  updateById_("Users", request.userId, { status: request.status });
  return {};
}

function deleteUser_(request, actor) {
  const user = rows_("Users").find(function (item) { return String(item.id) === String(request.userId); });
  if (!user) throw new Error("The requested user was not found.");
  if (String(user.id) === String(actor.id)) throw new Error("You cannot delete your own account.");
  if (user.role === "Master Admin" && user.status === "Approved" && rows_("Users").filter(function (item) { return item.role === "Master Admin" && item.status === "Approved"; }).length <= 1) {
    throw new Error("At least one approved Master Admin must remain.");
  }
  deleteById_("Users", request.userId);
  return {};
}

function addHouses_(request) {
  const houses = request.houses;
  if (!Array.isArray(houses) || houses.length < 1 || houses.length > 10) throw new Error("Add between 1 and 10 houses.");
  const current = rows_("Houses");
  const names = current.map(function (house) { return String(house.name).toLowerCase(); });
  houses.forEach(function (house) {
    const name = String(house.name || "").trim();
    if (!name) throw new Error("Every house needs a name.");
    if (names.indexOf(name.toLowerCase()) >= 0) throw new Error("House names must be unique.");
    names.push(name.toLowerCase());
  });
  houses.forEach(function (house) { append_("Houses", { id: String(house.id || makeId_()), name: String(house.name).trim(), description: String(house.description || "").trim(), createdAt: String(house.createdAt || now_()), color: houseColor_(house.color) }); });
  return {};
}

function updateHouse_(request) {
  const name = String(request.name || "").trim();
  if (!name) throw new Error("House name is required.");
  if (rows_("Houses").some(function (house) { return String(house.id) !== String(request.houseId) && String(house.name).toLowerCase() === name.toLowerCase(); })) throw new Error("House names must be unique.");
  updateById_("Houses", request.houseId, { name: name, description: String(request.description || "").trim(), color: houseColor_(request.color) });
  return {};
}

function houseColor_(value) {
  const color = String(value || "#6e9a72").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error("Choose a valid house color.");
  return color.toLowerCase();
}

function deleteHouse_(request) {
  deleteById_("Houses", request.houseId);
  return {};
}

function optionSheet_(kind) {
  const map = { categories: "Categories", events: "Events", points: "Points", positions: "Positions" };
  const sheet = map[kind];
  if (!sheet) throw new Error("Invalid setup list.");
  return sheet;
}

function addOptions_(request) {
  const sheet = optionSheet_(request.kind);
  if (!Array.isArray(request.values) || request.values.length < 1 || request.values.length > 10) throw new Error("Enter between 1 and 10 values.");
  const numeric = sheet === "Points" || sheet === "Positions";
  const existing = rows_(sheet).map(function (item) { return String(item.value).toLowerCase(); });
  const values = request.values.map(function (entry) {
    const value = entry && typeof entry === "object" ? entry.value : entry;
    const normalized = String(value).trim();
    if (!normalized) throw new Error("Values cannot be blank.");
    if (numeric && (!/^\d+$/.test(normalized) || Number(normalized) < 1)) throw new Error(sheet + " must be positive whole numbers.");
    return {
      id: String(entry && typeof entry === "object" && entry.id || makeId_()),
      value: numeric ? String(Number(normalized)) : normalized,
      createdAt: String(entry && typeof entry === "object" && entry.createdAt || now_())
    };
  });
  values.forEach(function (value) {
    const key = value.value.toLowerCase();
    if (existing.indexOf(key) >= 0) throw new Error("Values must be unique; " + value.value + " already exists.");
    existing.push(key);
  });
  values.forEach(function (item) { append_(sheet, item); });
  return {};
}

function deleteOption_(request) {
  deleteById_(optionSheet_(request.kind), request.itemId);
  return {};
}

function clearOptions_(request) {
  clearData_(optionSheet_(request.kind));
  return {};
}

function addScoreEntry_(request) {
  if (!request.categoryId || !request.eventId) throw new Error("Select a category and event.");
  if (!rows_("Categories").some(function (item) { return String(item.id) === String(request.categoryId); })) throw new Error("The selected category no longer exists.");
  if (!rows_("Events").some(function (item) { return String(item.id) === String(request.eventId); })) throw new Error("The selected event no longer exists.");
  const currentHouses = rows_("Houses");
  if (!currentHouses.length) throw new Error("Add houses before recording scores.");
  if (!Array.isArray(request.awards) || request.awards.length !== currentHouses.length) throw new Error("Provide an award or zero status for every house.");
  const houseIds = currentHouses.map(function (house) { return String(house.id); });
  const seen = {};
  const nonzero = [];
  request.awards.forEach(function (award) {
    if (houseIds.indexOf(String(award.houseId)) < 0 || seen[award.houseId]) throw new Error("Each house must appear exactly once.");
    seen[award.houseId] = true;
    if (award.zero) {
      if (Number(award.points) !== 0) throw new Error("Awarded 0 houses must receive zero points.");
    } else {
      const point = rows_("Points").find(function (item) { return Number(item.value) === Number(award.points); });
      if (!point) throw new Error("Select a configured point value for each house.");
      nonzero.push(Number(award.points));
    }
  });
  if (new Set(nonzero).size !== nonzero.length) throw new Error("Non-zero point values must be unique between houses.");
  append_("ScoreEntries", {
    id: String(request.id || makeId_()), categoryId: request.categoryId, eventId: request.eventId,
    awards: JSON.stringify(request.awards.map(function (award) { return { houseId: String(award.houseId), points: Number(award.points) }; })),
    createdBy: String(request.createdBy || "").slice(0, 100), createdAt: now_()
  });
  return {};
}

function clearScoreEntries_() {
  clearData_("ScoreEntries");
  return {};
}

function addCertificates_(request) {
  validateCertificateShared_(request.categoryId, request.eventId);
  if (!Array.isArray(request.athletes) || !request.athletes.length || request.athletes.length > 100) throw new Error("Add at least one athlete.");
  request.athletes.forEach(function (athlete) {
    validateAthlete_(athlete);
    const templateId = Number(athlete.templateId || 1);
    if (!Number.isInteger(templateId) || templateId < 1 || templateId > 20) throw new Error("Choose a valid certificate design.");
  });
  request.athletes.forEach(function (athlete) {
    const certificateId = String(athlete.id || makeId_());
    const createdAt = String(athlete.createdAt || now_());
    append_("Certificates", {
      id: certificateId, athleteName: String(athlete.athleteName).trim(), houseId: String(athlete.houseId),
      categoryId: request.categoryId, eventId: request.eventId, position: Number(athlete.position), createdAt: createdAt,
      certificateNumber: String(athlete.certificateNumber || certificateNumber_(certificateId, createdAt)),
      templateId: String(athlete.templateId || "1")
    });
  });
  return {};
}

function certificateNumber_(certificateId, createdAt) {
  const year = new Date(createdAt).getFullYear();
  const suffix = String(certificateId).replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase().padStart(8, "0");
  return "FH-" + year + "-" + suffix;
}

function validateCertificateShared_(categoryId, eventId) {
  if (!rows_("Categories").some(function (item) { return String(item.id) === String(categoryId); })) throw new Error("Select a valid category.");
  if (!rows_("Events").some(function (item) { return String(item.id) === String(eventId); })) throw new Error("Select a valid event.");
}

function validateAthlete_(athlete) {
  if (!String(athlete.athleteName || "").trim()) throw new Error("Athlete name is required.");
  if (!rows_("Houses").some(function (item) { return String(item.id) === String(athlete.houseId); })) throw new Error("Select a valid house.");
  if (!rows_("Positions").some(function (item) { return Number(item.value) === Number(athlete.position); })) throw new Error("Select a configured position.");
}

function updateCertificate_(request) {
  validateCertificateShared_(request.categoryId, request.eventId);
  validateAthlete_(request);
  updateById_("Certificates", request.certificateId, {
    athleteName: String(request.athleteName).trim(), houseId: String(request.houseId),
    categoryId: request.categoryId, eventId: request.eventId, position: Number(request.position)
  });
  return {};
}

function deleteCertificate_(request) {
  deleteById_("Certificates", request.certificateId);
  return {};
}

function clearCertificates_() {
  clearData_("Certificates");
  clearData_("PrintHistory");
  return {};
}
